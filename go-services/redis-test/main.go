package main

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/go-redis/redis/v8"
)

func main() {
	// Initialize Redis client with Redis Cloud connection
	redisClient := redis.NewClient(&redis.Options{
		Addr:     "redis-18764.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com:18764",
		Username: "default",
		Password: "dljBc2IR2S1CPZyZMBBtFDb8nwYxhkwb",
		DB:       0,
	})

	ctx := context.Background()

	// Test connection
	pong, err := redisClient.Ping(ctx).Result()
	if err != nil {
		log.Fatalf("Failed to connect to Redis: %v", err)
	}
	fmt.Printf("Redis connection successful: %s\n", pong)

	// Test set and get
	err = redisClient.Set(ctx, "test_key", "Hello from Go!", time.Hour).Err()
	if err != nil {
		log.Fatalf("Failed to set key: %v", err)
	}
	fmt.Println("Successfully set key")

	val, err := redisClient.Get(ctx, "test_key").Result()
	if err != nil {
		log.Fatalf("Failed to get key: %v", err)
	}
	fmt.Printf("Value for test_key: %s\n", val)

	// Test publish
	err = redisClient.Publish(ctx, "test_channel", "Hello from Go publisher!").Err()
	if err != nil {
		log.Fatalf("Failed to publish message: %v", err)
	}
	fmt.Println("Successfully published message")

	// Close connection
	err = redisClient.Close()
	if err != nil {
		log.Fatalf("Failed to close Redis connection: %v", err)
	}
	fmt.Println("Redis connection closed")
}
