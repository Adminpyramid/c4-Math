package main

import (
	"fmt"
	"math/rand"
	"time"

	c4Math "github.com/Adminpyramid/c4-Math/c4Trial"
)

func main() {
	rand.Seed(time.Now().UnixNano())
	a := rand.Intn(100)
	b := rand.Intn(100)
	result := c4Math.Add(a, b)
	fmt.Printf("The sum of %d and %d is %d\n", a, b, result)
}
