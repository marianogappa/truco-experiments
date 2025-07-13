package truco

import (
	"math/rand"
)

type Deck struct {
	cards []Card
}

func NewDeck() *Deck {
	suits := []string{ESPADA, BASTO, ORO, COPA}
	numbers := []int{1, 2, 3, 4, 5, 6, 7, 10, 11, 12}

	var cards []Card
	for _, suit := range suits {
		for _, number := range numbers {
			cards = append(cards, Card{Suit: suit, Number: number})
		}
	}

	return &Deck{cards: cards}
}

func (d *Deck) Shuffle() {
	rand.Shuffle(len(d.cards), func(i, j int) {
		d.cards[i], d.cards[j] = d.cards[j], d.cards[i]
	})
}

func (d *Deck) DealCard() (Card, bool) {
	if len(d.cards) == 0 {
		return Card{}, false
	}
	card := d.cards[0]
	d.cards = d.cards[1:]
	return card, true
}

func (d *Deck) DealHands() []Hand {
	if len(d.cards) < 12 {
		return nil // Not enough cards for 4 hands of 3 cards each
	}

	var hands []Hand
	for i := 0; i < 4; i++ {
		start := i * 3
		end := start + 3
		handCards := d.cards[start:end]
		hand := Hand{
			Unrevealed: handCards,
			Revealed:   []Card{},
		}
		hands = append(hands, hand)
	}

	// Remove the dealt cards from the deck
	d.cards = d.cards[12:]

	return hands
}

func (d *Deck) Reset() {
	d.cards = NewDeck().cards
}
