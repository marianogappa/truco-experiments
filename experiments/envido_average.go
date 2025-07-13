package experiments

import (
	"fmt"

	"github.com/marianogappa/experiments-truco/truco"
	"github.com/samber/lo"
)

func RunEnvidoAverageExperiment() {
	const numHands = 10_000_000
	const numRounds = numHands / 4

	var totalEnvidoScore int
	var totalBestScorePerRound int

	deck := truco.NewDeck()

	for i := 0; i < numRounds; i++ {
		deck.Reset()
		deck.Shuffle()

		hands := deck.DealHands()
		if hands == nil {
			continue
		}

		// Calculate individual hand scores
		for _, hand := range hands {
			score := hand.EnvidoScore()
			totalEnvidoScore += score
		}

		// Find the best score in this round
		scores := lo.Map(hands, func(hand truco.Hand, _ int) int {
			return hand.EnvidoScore()
		})
		bestScore := lo.Max(scores)
		totalBestScorePerRound += bestScore
	}

	avgIndividualScore := float64(totalEnvidoScore) / float64(numHands)
	avgBestScorePerRound := float64(totalBestScorePerRound) / float64(numRounds)

	fmt.Printf("Envido Average Experiment Results:\n")
	fmt.Printf("Number of hands analyzed: %d\n", numHands)
	fmt.Printf("Number of rounds analyzed: %d\n", numRounds)
	fmt.Printf("Average Envido score per hand (single player): %.2f\n", avgIndividualScore)
	fmt.Printf("Average best Envido score per round (round of 4 players): %.2f\n", avgBestScorePerRound)
}
