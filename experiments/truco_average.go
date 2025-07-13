package experiments

import (
	"fmt"
	"math/rand"
	"sort"

	"github.com/marianogappa/experiments-truco/truco"
)

func RunTrucoAverageExperiment() {
	const numHands = 10_000_000
	const numRounds = numHands / 4

	var totalTop3ScoreSum int
	var scoreToCards = make(map[int][][]truco.Card)

	deck := truco.NewDeck()

	for i := 0; i < numRounds; i++ {
		deck.Reset()
		deck.Shuffle()

		hands := deck.DealHands()
		if hands == nil {
			continue
		}

		// Collect all 12 cards from the round
		var allCards []truco.Card
		for _, hand := range hands {
			allCards = append(allCards, hand.Unrevealed...)
		}

		// Sort cards by their individual truco scores (descending)
		sort.Slice(allCards, func(i, j int) bool {
			return allCards[i].TrucoScore() > allCards[j].TrucoScore()
		})

		// Get the top 3 cards
		top3Cards := allCards[:3]
		top3ScoreSum := 0
		for _, card := range top3Cards {
			top3ScoreSum += card.TrucoScore()
		}

		totalTop3ScoreSum += top3ScoreSum
		scoreToCards[top3ScoreSum] = append(scoreToCards[top3ScoreSum], top3Cards)
	}

	avgTop3ScoreSum := float64(totalTop3ScoreSum) / float64(numRounds)

	fmt.Printf("Truco Average Experiment Results:\n")
	fmt.Printf("Number of rounds analyzed: %d\n", numRounds)
	fmt.Printf("Average top 3 truco score sum per round: %.2f\n", avgTop3ScoreSum)

	// Find the average truco score sum and pick a random 3 cards from its slice
	avgScore := int(avgTop3ScoreSum)
	if cards, exists := scoreToCards[avgScore]; exists && len(cards) > 0 {
		randomIndex := rand.Intn(len(cards))
		randomCards := cards[randomIndex]

		fmt.Printf("Random 3 cards with this score sum: ")
		for i, card := range randomCards {
			if i > 0 {
				fmt.Print(", ")
			}
			fmt.Printf("%s", card)
		}
		fmt.Println()
		fmt.Printf("(debug) Individual card scores: %d, %d, %d\n",
			randomCards[0].TrucoScore(),
			randomCards[1].TrucoScore(),
			randomCards[2].TrucoScore())
	} else {
		fmt.Printf("No cards found with the average score sum of %d\n", avgScore)
	}
}
