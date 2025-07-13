package experiments

import (
	"fmt"
	"sort"

	"github.com/marianogappa/experiments-truco/truco"
	"github.com/samber/lo"
)

type CardCombination struct {
	Card1 int
	Card2 int
	Score int
}

func RunEnvidoCombinationsExperiment() {
	// Scores we care about: 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32
	targetScores := []int{22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32}

	// Valid card numbers for Envido (1-7, 10+ are worth 0)
	// Note: 8 and 9 are not in the deck, and we can't use the same number twice
	validNumbers := []int{1, 2, 3, 4, 5, 6, 7}

	// Store combinations by score
	combinationsByScore := make(map[int][]CardCombination)

	// Generate all possible combinations of two different cards
	for i, num1 := range validNumbers {
		for j := i + 1; j < len(validNumbers); j++ { // Start from i+1 to avoid same number
			num2 := validNumbers[j]

			// Create cards with ORO suit (suits don't matter for this experiment)
			card1 := truco.Card{Suit: truco.ORO, Number: num1}
			card2 := truco.Card{Suit: truco.ORO, Number: num2}

			// Calculate Envido score for this combination
			// Envido score = sum of card values + 20 (for same suit)
			score := card1.EnvidoValue() + card2.EnvidoValue() + 20

			// Check if this score is one we care about
			if lo.Contains(targetScores, score) {
				combination := CardCombination{
					Card1: num1,
					Card2: num2,
					Score: score,
				}
				combinationsByScore[score] = append(combinationsByScore[score], combination)
			}
		}
	}

	// Print results sorted by score
	fmt.Printf("Envido Combinations Experiment Results:\n")
	fmt.Printf("Finding all distinct number combinations for two cards to achieve specific scores:\n\n")

	for _, score := range targetScores {
		combinations := combinationsByScore[score]
		if len(combinations) == 0 {
			fmt.Printf("Score %d: No combinations found\n", score)
			continue
		}

		// Sort combinations for consistent output
		sort.Slice(combinations, func(i, j int) bool {
			if combinations[i].Card1 != combinations[j].Card1 {
				return combinations[i].Card1 < combinations[j].Card1
			}
			return combinations[i].Card2 < combinations[j].Card2
		})

		fmt.Printf("Score %d (%d combinations):\n", score, len(combinations))
		for _, combo := range combinations {
			fmt.Printf("  %d + %d = %d\n", combo.Card1, combo.Card2, combo.Score)
		}
		fmt.Println()
	}

	// Summary
	totalCombinations := 0
	for _, combinations := range combinationsByScore {
		totalCombinations += len(combinations)
	}
	fmt.Printf("Total combinations found: %d\n", totalCombinations)
}
