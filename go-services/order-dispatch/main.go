package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
)

// Order represents an order to be dispatched
type Order struct {
	ID                    string    `json:"id"`
	OrderNumber           string    `json:"orderNumber"`
	RestaurantID          string    `json:"restaurantId"`
	UserID                string    `json:"userId"`
	Status                string    `json:"status"`
	DeliveryAddress       string    `json:"deliveryAddress"`
	EstimatedDeliveryTime time.Time `json:"estimatedDeliveryTime"`
}

// Driver represents a delivery driver
type Driver struct {
	ID        string  `json:"id"`
	Name      string  `json:"name"`
	Phone     string  `json:"phone"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Status    string  `json:"status"` // available, busy, offline
}

// OrderAssignment represents an order assigned to a driver
type OrderAssignment struct {
	OrderID    string    `json:"orderId"`
	DriverID   string    `json:"driverId"`
	AssignedAt time.Time `json:"assignedAt"`
}

var (
	redisClient *redis.Client
	upgrader    = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			return true // Allow all connections in development
		},
	}
	// In-memory storage for active connections
	driverConnections = make(map[string]*websocket.Conn)
)

func main() {
	// Initialize Redis client with Redis Cloud connection
	redisClient = redis.NewClient(&redis.Options{
		Addr:     getEnv("REDIS_ADDR", "redis-18764.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com:18764"),
		Username: getEnv("REDIS_USERNAME", "default"),
		Password: getEnv("REDIS_PASSWORD", "dljBc2IR2S1CPZyZMBBtFDb8nwYxhkwb"),
		DB:       0,
	})

	// Create router
	r := mux.NewRouter()

	// API routes
	r.HandleFunc("/health", healthCheckHandler).Methods("GET")
	r.HandleFunc("/api/dispatch/orders", getOrdersHandler).Methods("GET")
	r.HandleFunc("/api/dispatch/orders/{id}/assign", assignOrderHandler).Methods("POST")
	r.HandleFunc("/api/dispatch/drivers", getDriversHandler).Methods("GET")
	r.HandleFunc("/api/dispatch/drivers/{id}/location", updateDriverLocationHandler).Methods("POST")

	// WebSocket route for real-time driver updates
	r.HandleFunc("/ws/drivers/{id}", driverWebSocketHandler)

	// Start listening for Redis messages in a goroutine
	go subscribeToOrderEvents()

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + getEnv("PORT", "8080"),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server on port %s", getEnv("PORT", "8080"))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on %s: %v", getEnv("PORT", "8080"), err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Create a deadline to wait for
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Close all WebSocket connections
	for _, conn := range driverConnections {
		conn.Close()
	}

	// Close Redis client
	redisClient.Close()

	// Shutdown server
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exiting")
}

// Health check handler
func healthCheckHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status":    "ok",
		"timestamp": time.Now().Format(time.RFC3339),
		"service":   "order-dispatch",
	})
}

// Get all pending orders
func getOrdersHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// Get all orders from Redis
	ordersJSON, err := redisClient.LRange(ctx, "pending_orders", 0, -1).Result()
	if err != nil {
		http.Error(w, "Failed to get orders", http.StatusInternalServerError)
		return
	}

	// Parse orders
	var orders []Order
	for _, orderJSON := range ordersJSON {
		var order Order
		if err := json.Unmarshal([]byte(orderJSON), &order); err != nil {
			continue
		}
		orders = append(orders, order)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(orders)
}

// Assign order to driver
func assignOrderHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	vars := mux.Vars(r)
	orderID := vars["id"]

	// Parse request body
	var requestBody struct {
		DriverID string `json:"driverId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get order from Redis
	orderJSON, err := redisClient.LRem(ctx, "pending_orders", 1, orderID).Result()
	if err != nil || orderJSON == 0 {
		http.Error(w, "Order not found", http.StatusNotFound)
		return
	}

	// Create assignment
	assignment := OrderAssignment{
		OrderID:    orderID,
		DriverID:   requestBody.DriverID,
		AssignedAt: time.Now(),
	}

	// Save assignment to Redis
	assignmentJSON, _ := json.Marshal(assignment)
	redisClient.HSet(ctx, "order_assignments", orderID, assignmentJSON)

	// Update driver status
	redisClient.HSet(ctx, "drivers", requestBody.DriverID, `{"status": "busy"}`)

	// Publish assignment event
	redisClient.Publish(ctx, "order_assigned", assignmentJSON)

	// Notify driver via WebSocket if connected
	if conn, ok := driverConnections[requestBody.DriverID]; ok {
		conn.WriteJSON(map[string]interface{}{
			"type":       "order_assigned",
			"assignment": assignment,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(assignment)
}

// Get all available drivers
func getDriversHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// Get all drivers from Redis
	driversMap, err := redisClient.HGetAll(ctx, "drivers").Result()
	if err != nil {
		http.Error(w, "Failed to get drivers", http.StatusInternalServerError)
		return
	}

	// Parse drivers
	var drivers []Driver
	for driverID, driverJSON := range driversMap {
		var driver Driver
		if err := json.Unmarshal([]byte(driverJSON), &driver); err != nil {
			continue
		}
		driver.ID = driverID
		drivers = append(drivers, driver)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(drivers)
}

// Update driver location
func updateDriverLocationHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	vars := mux.Vars(r)
	driverID := vars["id"]

	// Parse request body
	var requestBody struct {
		Latitude  float64 `json:"latitude"`
		Longitude float64 `json:"longitude"`
	}
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get current driver data
	driverJSON, err := redisClient.HGet(ctx, "drivers", driverID).Result()
	if err != nil {
		// Driver doesn't exist, create new
		driver := Driver{
			ID:        driverID,
			Latitude:  requestBody.Latitude,
			Longitude: requestBody.Longitude,
			Status:    "available",
		}
		driverJSONBytes, _ := json.Marshal(driver)
		driverJSON = string(driverJSONBytes)
	} else {
		// Update existing driver
		var driver Driver
		json.Unmarshal([]byte(driverJSON), &driver)
		driver.Latitude = requestBody.Latitude
		driver.Longitude = requestBody.Longitude
		driverJSONBytes, _ := json.Marshal(driver)
		driverJSON = string(driverJSONBytes)
	}

	// Save updated driver to Redis
	redisClient.HSet(ctx, "drivers", driverID, string(driverJSON))

	// Publish driver location update
	redisClient.Publish(ctx, "driver_location_updated", fmt.Sprintf(`{"driverId": "%s", "latitude": %f, "longitude": %f}`, driverID, requestBody.Latitude, requestBody.Longitude))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "ok"}`))
}

// WebSocket handler for real-time driver updates
func driverWebSocketHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	driverID := vars["id"]

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Store connection
	driverConnections[driverID] = conn

	// Clean up on disconnect
	defer func() {
		conn.Close()
		delete(driverConnections, driverID)
	}()

	// Handle incoming messages
	for {
		messageType, p, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading message: %v", err)
			break
		}

		// Echo the message back for now
		if err := conn.WriteMessage(messageType, p); err != nil {
			log.Printf("Error writing message: %v", err)
			break
		}
	}
}

// Subscribe to Redis channels for order events
func subscribeToOrderEvents() {
	ctx := context.Background()
	pubsub := redisClient.Subscribe(ctx, "new_order", "order_status_updated")
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		switch msg.Channel {
		case "new_order":
			handleNewOrder(msg.Payload)
		case "order_status_updated":
			handleOrderStatusUpdate(msg.Payload)
		}
	}
}

// Handle new order event
func handleNewOrder(orderJSON string) {
	ctx := context.Background()

	// Parse order
	var order Order
	if err := json.Unmarshal([]byte(orderJSON), &order); err != nil {
		log.Printf("Failed to parse order: %v", err)
		return
	}

	// Add to pending orders list
	redisClient.RPush(ctx, "pending_orders", orderJSON)

	// Find nearby drivers
	// This is a simplified version - in a real app, you'd use geospatial queries
	driversMap, err := redisClient.HGetAll(ctx, "drivers").Result()
	if err != nil {
		log.Printf("Failed to get drivers: %v", err)
		return
	}

	// Notify available drivers
	for driverID, driverJSON := range driversMap {
		var driver Driver
		if err := json.Unmarshal([]byte(driverJSON), &driver); err != nil {
			continue
		}

		if driver.Status == "available" {
			if conn, ok := driverConnections[driverID]; ok {
				conn.WriteJSON(map[string]interface{}{
					"type":  "new_order_available",
					"order": order,
				})
			}
		}
	}
}

// Handle order status update event
func handleOrderStatusUpdate(updateJSON string) {
	// Parse update
	var update struct {
		OrderID string `json:"orderId"`
		Status  string `json:"status"`
	}
	if err := json.Unmarshal([]byte(updateJSON), &update); err != nil {
		log.Printf("Failed to parse update: %v", err)
		return
	}

	ctx := context.Background()

	// If order is completed or cancelled, update driver status
	if update.Status == "delivered" || update.Status == "cancelled" {
		// Get assignment
		assignmentJSON, err := redisClient.HGet(ctx, "order_assignments", update.OrderID).Result()
		if err != nil {
			return
		}

		var assignment OrderAssignment
		if err := json.Unmarshal([]byte(assignmentJSON), &assignment); err != nil {
			return
		}

		// Update driver status to available
		driverJSON, err := redisClient.HGet(ctx, "drivers", assignment.DriverID).Result()
		if err != nil {
			return
		}

		var driver Driver
		if err := json.Unmarshal([]byte(driverJSON), &driver); err != nil {
			return
		}

		driver.Status = "available"
		updatedDriverJSON, _ := json.Marshal(driver)
		redisClient.HSet(ctx, "drivers", assignment.DriverID, string(updatedDriverJSON))

		// Remove assignment
		redisClient.HDel(ctx, "order_assignments", update.OrderID)

		// Notify driver
		if conn, ok := driverConnections[assignment.DriverID]; ok {
			conn.WriteJSON(map[string]interface{}{
				"type":    "order_completed",
				"orderId": update.OrderID,
			})
		}
	}
}

// Helper function to get environment variable with fallback
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
