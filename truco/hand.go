package truco

import "github.com/samber/lo"

type Hand struct {
	Unrevealed []Card
	Revealed   []Card
}

func (h Hand) EnvidoScore() int {
	var (
		maxScore     = 0
		suitToValues = make(map[string][]int)
	)
	for _, card := range append(h.Unrevealed, h.Revealed...) {
		suitToValues[card.Suit] = append(suitToValues[card.Suit], card.Number)
		if card.Number >= 10 {
			suitToValues[card.Suit][len(suitToValues[card.Suit])-1] = 0
		}
	}
	for suit, values := range suitToValues {
		switch len(values) {
		case 3:
			maxScore = lo.Max([]int{
				maxScore,
				suitToValues[suit][0] + suitToValues[suit][1] + 20,
				suitToValues[suit][0] + suitToValues[suit][2] + 20,
				suitToValues[suit][1] + suitToValues[suit][2] + 20,
			})
		case 2:
			maxScore = lo.Max([]int{maxScore, suitToValues[suit][0] + suitToValues[suit][1] + 20})
		case 1:
			maxScore = lo.Max([]int{maxScore, suitToValues[suit][0]})
		}
	}
	return maxScore
}

func (h Hand) TrucoScore() int {
	totalScore := 0
	for _, card := range append(h.Unrevealed, h.Revealed...) {
		totalScore += card.TrucoScore()
	}
	return totalScore
}
