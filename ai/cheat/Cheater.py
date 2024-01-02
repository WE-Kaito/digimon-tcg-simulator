class Cheater():

    def __init__(self, bot, game):
        self.bot = bot
        self.game = game
    
    def get_card_from_deck_in_hand(self, ws, unique_card_number, card_name):
        card_index = None
        for i in range(len(self.game['player2DeckField'])):
            card = self.game['player2DeckField'][i]
            if card['name'] == card_name and unique_card_number == card['uniqueCardNumber']:
                card_index = i
                break
        if card_index is None:
            print('CANNOT FIND CARD WHEN CHEATING')
            return
        self.game['player2Hand'].append(self.game['player2DeckField'].pop(card_index))
        update = {}
        update['playerHand'] = self.game['player2Hand']
        update['playerDeckField'] = self.game['player2DeckField']
        update['playerReveal'] = self.game['player2Reveal']
        update['playerDigi1'] = []
        update['playerDigi2'] = []
        update['playerDigi3'] = []
        update['playerDigi4'] = []
        update['playerDigi5'] = []
        update['playerDigi6'] = []
        update['playerDigi7'] = []
        update['playerDigi8'] = []
        update['playerDigi9'] = []
        update['playerDigi10'] = []
        update['playerDigi11'] = []
        update['playerDigi12'] = []
        update['playerDigi13'] = []
        update['playerDigi14'] = []
        update['playerDigi15'] = []
        update['playerBreedingArea'] = []
        update['playerEggDeck'] = self.game['player2EggDeck']
        update['playerSecurity'] = self.game['player2Security']
        update['playerTrash'] = []
        self.bot.update_game(ws, update)
                
