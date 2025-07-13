package main

import (
	"flag"
	"fmt"

	"github.com/marianogappa/experiments-truco/experiments"
)

func main() {
	// Define experiment flags
	envidoAverage := flag.Bool("envido-average", false, "Run the Envido average experiment")
	trucoAverage := flag.Bool("truco-average", false, "Run the Truco average experiment")
	envidoCombinations := flag.Bool("envido-combinations", false, "Run the Envido combinations experiment")
	openHTML := flag.Bool("code-practice", false, "Open the HTML practice file in default browser")

	flag.Parse()

	// Check if any experiment flag was provided
	if !*envidoAverage && !*trucoAverage && !*envidoCombinations && !*openHTML {
		fmt.Println("Usage: go run main.go [experiment-flag]")
		fmt.Println("Available experiments:")
		fmt.Println("  -envido-average: Calculate average Envido scores")
		fmt.Println("  -truco-average: Calculate average Truco scores")
		fmt.Println("  -envido-combinations: Find all card combinations for specific Envido scores")
		fmt.Println("  -code-practice: Open the HTML practice file in default browser")
		flag.PrintDefaults()
		return
	}

	// Run the selected experiment
	if *envidoAverage {
		experiments.RunEnvidoAverageExperiment()
	}
	if *trucoAverage {
		experiments.RunTrucoAverageExperiment()
	}
	if *envidoCombinations {
		experiments.RunEnvidoCombinationsExperiment()
	}
	if *openHTML {
		experiments.RunOpenHTMLExperiment()
	}
}
