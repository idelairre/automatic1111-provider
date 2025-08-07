package main

import (
	"fmt"
	"io"
	"log"
	"net/http"
)

func postHandler(w http.ResponseWriter, r *http.Request) {
	// Only handle POST requests
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	fmt.Println("=== Incoming POST Request ===")
	fmt.Printf("URL: %s\n", r.URL.String())
	fmt.Printf("Method: %s\n", r.Method)
	fmt.Printf("Remote Address: %s\n", r.RemoteAddr)
	fmt.Printf("Content-Length: %d\n", r.ContentLength)

	// Log all headers
	fmt.Println("\n--- Headers ---")
	for name, values := range r.Header {
		for _, value := range values {
			fmt.Printf("%s: %s\n", name, value)
		}
	}

	// Read and log the body
	fmt.Println("\n--- Body ---")
	body, err := io.ReadAll(r.Body)
	if err != nil {
		log.Printf("Error reading body: %v", err)
		http.Error(w, "Error reading body", http.StatusInternalServerError)
		return
	}
	defer r.Body.Close()

	if len(body) > 0 {
		fmt.Printf("Body content:\n%s\n", string(body))
	} else {
		fmt.Println("Body is empty")
	}

	fmt.Println("=== End of Request ===\n")

	// Send a simple response
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{"status": "received", "message": "Request logged successfully"}`)
}

func main() {
	// Set up the handler
	http.HandleFunc("/", postHandler)

	// Start the server
	addr := "localhost:7860"
	fmt.Printf("Starting server on %s\n", addr)
	fmt.Println("Server will log all incoming POST requests...")
	fmt.Println("Press Ctrl+C to stop the server\n")

	log.Fatal(http.ListenAndServe(addr, nil))
}
