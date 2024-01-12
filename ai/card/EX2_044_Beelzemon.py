import math
import time

from Card import Card


class ST14_08_Beelzemon(Card):

    def __init__(self, bot, game, **kwargs):
        self.bot = bot
        self.game = game
        self.extra_args = kwargs
    
    async def when_trashed_effect(self, ws):
        for i in range(len(self.game['player2Trash'])):
                card = self.game['player2Trash'][i]
                if self.card_has_name_in_trash('Impmon'):
                    self.bot.ex2_044_beelzemon_when_trashed_stategy(ws)

    async def when_digivolving_when_attacking_effect(self, ws):
        trashed_cards = []
        for i in range(3):
            if len(self.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(self.bot.trash_top_card_of_deck(ws))
        for trashed_card in trashed_card:
            card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'])
            card_obj.when_trashed_effect(ws)
        self.bot.ex2_044_beelzemon_when_digivolving_when_attacking_stategy(ws)

    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        self.when_digivolving_when_attacking_effect()
    
    async def when_attacking_effect(self):
        self.when_digivolving_when_attacking_effect()
