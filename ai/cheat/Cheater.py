class Cheater():

    def __init__(self, bot):
        self.bot = bot
    
    async def get_card_from_deck_in_hand(self, ws, unique_card_number, card_name):
        card_index = None
        for i in range(len(self.bot.game['player2DeckField'])):
            card = self.bot.game['player2DeckField'][i]
            if card['name'] == card_name and unique_card_number == card['uniqueCardNumber']:
                card_index = i
                break
        if card_index is None:
            print('Could not find card when cheating.')
            return
        self.bot.game['player2Hand'].append(self.bot.game['player2DeckField'].pop(card_index))
        await self.bot.update_game(ws)
