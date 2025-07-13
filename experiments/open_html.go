package experiments

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
)

func RunOpenHTMLExperiment() {
	// Get the current working directory
	cwd, err := os.Getwd()
	if err != nil {
		fmt.Printf("Error getting current directory: %v\n", err)
		return
	}

	// Construct the path to the HTML file
	htmlPath := filepath.Join(cwd, "code-practice", "truco_coding_practice.html")

	// Check if the file exists
	if _, err := os.Stat(htmlPath); os.IsNotExist(err) {
		fmt.Printf("HTML file not found at: %s\n", htmlPath)
		return
	}

	// Determine the command to open the file based on the operating system
	var cmd *exec.Cmd
	switch runtime.GOOS {
	case "darwin": // macOS
		cmd = exec.Command("open", htmlPath)
	case "windows":
		cmd = exec.Command("cmd", "/c", "start", htmlPath)
	default: // Linux and other Unix-like systems
		cmd = exec.Command("xdg-open", htmlPath)
	}

	// Execute the command
	fmt.Printf("Opening HTML file: %s\n", htmlPath)
	err = cmd.Run()
	if err != nil {
		fmt.Printf("Error opening HTML file: %v\n", err)
		return
	}

	fmt.Println("HTML file opened successfully in default browser!")
}
