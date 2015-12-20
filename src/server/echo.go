package main

import (
	"fmt"
	"net/http"
)

// Echo function only echo
func Echo() {
	http.ListenAndServe(":8080",
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			fmt.Fprintf(w, "hello?!\n")
		}))
}
