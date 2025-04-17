package main

import (
	"context"
	"encoding/json"
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

// Location represents a geographical point
type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Timestamp int64   `json:"timestamp"`
}

// LocationUpdate represents a location update from a user or driver
type LocationUpdate struct {
	UserID   string   `json:"userId"`
	UserType string   `json:"userType"` // driver, customer
	Location Location `json:"location"`
	OrderID  string   `json:"orderId,omitempty"`
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
	connections = make(map[string]*websocket.Conn)
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
	r.HandleFunc("/api/location/update", updateLocationHandler).Methods("POST")
	r.HandleFunc("/api/location/user/{id}", getUserLocationHandler).Methods("GET")
	r.HandleFunc("/api/location/driver/{id}", getDriverLocationHandler).Methods("GET")
	r.HandleFunc("/api/location/order/{id}", getOrderLocationHandler).Methods("GET")

	// WebSocket route for real-time location updates
	r.HandleFunc("/ws/location/{type}/{id}", locationWebSocketHandler)

	// Start listening for Redis messages in a goroutine
	go subscribeToLocationUpdates()

	// Create HTTP server
	srv := &http.Server{
		Addr:         ":" + getEnv("PORT", "8081"),
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Starting server on port %s", getEnv("PORT", "8081"))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Could not listen on %s: %v", getEnv("PORT", "8081"), err)
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
	for _, conn := range connections {
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
		"service":   "location-tracker",
	})
}

// Update location handler
func updateLocationHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// Parse request body
	var update LocationUpdate
	if err := json.NewDecoder(r.Body).Decode(&update); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Set timestamp if not provided
	if update.Location.Timestamp == 0 {
		update.Location.Timestamp = time.Now().Unix()
	}

	// Store location in Redis
	locationKey := getLocationKey(update.UserType, update.UserID)
	locationJSON, _ := json.Marshal(update.Location)
	redisClient.Set(ctx, locationKey, locationJSON, 24*time.Hour)

	// If this is a driver with an active order, update order location
	if update.UserType == "driver" && update.OrderID != "" {
		orderLocationKey := "order_location:" + update.OrderID
		redisClient.Set(ctx, orderLocationKey, locationJSON, 24*time.Hour)
	}

	// Publish location update
	updateJSON, _ := json.Marshal(update)
	redisClient.Publish(ctx, "location_updates", string(updateJSON))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"status": "ok"}`))
}

// Get user location handler
func getUserLocationHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	vars := mux.Vars(r)
	userID := vars["id"]

	// Get location from Redis
	locationKey := getLocationKey("customer", userID)
	locationJSON, err := redisClient.Get(ctx, locationKey).Result()
	if err != nil {
		http.Error(w, "Location not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(locationJSON))
}

// Get driver location handler
func getDriverLocationHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	vars := mux.Vars(r)
	driverID := vars["id"]

	// Get location from Redis
	locationKey := getLocationKey("driver", driverID)
	locationJSON, err := redisClient.Get(ctx, locationKey).Result()
	if err != nil {
		http.Error(w, "Location not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(locationJSON))
}

// Get order location handler (returns driver location for the order)
func getOrderLocationHandler(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()
	vars := mux.Vars(r)
	orderID := vars["id"]

	// Get order location from Redis
	orderLocationKey := "order_location:" + orderID
	locationJSON, err := redisClient.Get(ctx, orderLocationKey).Result()
	if err != nil {
		http.Error(w, "Location not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(locationJSON))
}

// WebSocket handler for real-time location updates
func locationWebSocketHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	userType := vars["type"] // driver, customer, order
	id := vars["id"]

	// Upgrade HTTP connection to WebSocket
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("Failed to upgrade connection: %v", err)
		return
	}

	// Generate connection ID
	connectionID := userType + ":" + id

	// Store connection
	connections[connectionID] = conn

	// Clean up on disconnect
	defer func() {
		conn.Close()
		delete(connections, connectionID)
	}()

	// Send initial location if available
	ctx := context.Background()
	var locationKey string
	if userType == "order" {
		locationKey = "order_location:" + id
	} else {
		locationKey = getLocationKey(userType, id)
	}

	locationJSON, err := redisClient.Get(ctx, locationKey).Result()
	if err == nil {
		conn.WriteMessage(websocket.TextMessage, []byte(locationJSON))
	}

	// Handle incoming messages (client can send location updates)
	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			log.Printf("Error reading message: %v", err)
			break
		}

		// Parse location update
		var update LocationUpdate
		if err := json.Unmarshal(message, &update); err != nil {
			continue
		}

		// Set user ID and type from connection
		update.UserID = id
		update.UserType = userType

		// Process update
		// Send the update to the location update handler
		ctx := context.Background()
		locationKey := getLocationKey(update.UserType, update.UserID)
		locationJSON, _ := json.Marshal(update.Location)
		redisClient.Set(ctx, locationKey, locationJSON, 24*time.Hour)

		// Publish location update
		updateJSON, _ := json.Marshal(update)
		redisClient.Publish(ctx, "location_updates", string(updateJSON))
	}
}

// Subscribe to Redis channel for location updates
func subscribeToLocationUpdates() {
	ctx := context.Background()
	pubsub := redisClient.Subscribe(ctx, "location_updates")
	defer pubsub.Close()

	ch := pubsub.Channel()
	for msg := range ch {
		var update LocationUpdate
		if err := json.Unmarshal([]byte(msg.Payload), &update); err != nil {
			log.Printf("Failed to parse location update: %v", err)
			continue
		}

		// Notify connected clients
		notifyLocationUpdate(update)
	}
}

// Notify connected clients about location update
func notifyLocationUpdate(update LocationUpdate) {
	// Convert update to JSON
	updateJSON, _ := json.Marshal(update)

	// Notify based on user type
	switch update.UserType {
	case "driver":
		// Notify customers tracking this driver's order
		if update.OrderID != "" {
			orderConnectionID := "order:" + update.OrderID
			if conn, ok := connections[orderConnectionID]; ok {
				conn.WriteMessage(websocket.TextMessage, updateJSON)
			}
		}
	case "customer":
		// Notify driver assigned to customer's order
		// This would require additional logic to find the driver for the order
	}

	// Notify specific user
	connectionID := update.UserType + ":" + update.UserID
	if conn, ok := connections[connectionID]; ok {
		conn.WriteMessage(websocket.TextMessage, updateJSON)
	}
}

// Helper function to get location key for Redis
func getLocationKey(userType, userID string) string {
	return userType + "_location:" + userID
}

// Helper function to get environment variable with fallback
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
