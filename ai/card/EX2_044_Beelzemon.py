import math
import time

from card.Card import Card


class EX2_044_Beelzemon(Card):

    def __init__(self, bot, **kwargs):
        super().__init__()
        self.bot = bot
        self.extra_args = kwargs
    
    async def when_trashed_effect(self, ws):
        if self.bot.card_has_name_in_trash('Impmon'):
            await self.bot.ex2_044_beelzemon_when_trashed_stategy(ws)

    async def when_digivolving_when_attacking_effect(self, ws):
        trashed_cards = []
        for i in range(3):
            if len(self.bot.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(await self.bot.trash_top_card_of_deck(ws))
        for i in range(len(trashed_cards)):
            card_obj = self.bot.card_factory.get_card(trashed_cards[i]['uniqueCardNumber'], trash_index=i)
            await card_obj.when_trashed_effect(ws)
        await self.bot.ex2_044_beelzemon_when_digivolving_when_attacking_stategy(ws)

    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        await self.when_digivolving_when_attacking_effect(ws)
    
    async def when_attacking_effect(self, ws):
        await self.when_digivolving_when_attacking_effect(ws)
