package version

import "fmt"

// Version is the module's version string.
var Version = "v0.1.0"

// Print prints the current version to stdout.
func Print() {
	fmt.Println("Version:", Version)
}
