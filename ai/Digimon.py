class Digimon:

    def __init__(self, card):
        self.card = card
        self.digivolution_cards = []

    def get_card(self):
        return self.card

    def get_digivolution_cards(self):
        return self.digivolution_cards

    def digivolve(self, card):
        digivolved = Digimon(card)
        digivolved.digivolution_cards.extend(self.digivolution_cards)
        digivolved.digivolution_cards.append(self.card)
        return digivolved
    
    def trash_digivolution_card(self, i):
        self.digivolution_cards.pop(i)
    
    def de_digivolve(self, n):
        n = min(n, len(self.digivolution_cards))
        if n == 0:
            print(f"Card {self.card['name']} cannot does not have any digivolution card. No digivolution will happen.")
        de_digivolved = Digimon(self.digivolution_cards[-n])
        self.digivolution_cards[:-n]
