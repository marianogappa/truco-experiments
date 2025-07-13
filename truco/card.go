package truco

import "fmt"

const (
	ESPADA = "espada"
	BASTO  = "basto"
	ORO    = "oro"
	COPA   = "copa"
)

type Card struct {
	Suit   string
	Number int
}

func (c Card) String() string {
	return fmt.Sprintf("%d de %s", c.Number, c.Suit)
}

func (c Card) EnvidoValue() int {
	if c.Number >= 10 {
		return 0
	}
	return c.Number
}

func (c Card) TrucoScore() int {
	specialValues := map[Card]int{
		{Suit: ESPADA, Number: 1}: 19,
		{Suit: BASTO, Number: 1}:  18,
		{Suit: ESPADA, Number: 7}: 17,
		{Suit: ORO, Number: 7}:    16,
	}
	if specialValue, ok := specialValues[c]; ok {
		return specialValue
	}
	if c.Number <= 3 {
		return c.Number + 12
	}
	return c.Number
}

func (c Card) IsBetterOrEqualThan(other Card) bool {
	return c.TrucoScore() >= other.TrucoScore()
}

func (c Card) IsBetterThan(other Card) bool {
	return c.TrucoScore() > other.TrucoScore()
}

func ExampleCardOfTrucoValue(value int) (Card, bool) {
	deck := NewDeck()
	deck.Shuffle()
	for {
		card, ok := deck.DealCard()
		if !ok {
			return Card{}, false
		}
		if card.TrucoScore() == value {
			return card, true
		}
	}
}
