import math
import time

from card.Card import Card


class EX2_044_Beelzemon(Card):
    
    async def when_trashed_effect(self, ws):
        await self.bot.send_message(ws, f"EX2-044 Beelzemon when trashed effect:")
        if self.bot.card_has_name_in_trash('Impmon'):
            await self.bot.ex2_044_beelzemon_when_trashed_stategy(ws)

    async def when_digivolving_when_attacking_effect(self, ws):
        trashed_cards = []
        for i in range(3):
            if len(self.bot.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(await self.bot.trash_top_card_of_deck(ws))
        for trashed_card in trashed_cards:
            card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'], card_id=trashed_card['id'])
            await card_obj.when_trashed_effect(ws)
        await self.bot.ex2_044_beelzemon_when_digivolving_when_attacking_stategy(ws)

    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        await self.bot.send_message(ws, f"EX2-044 Beelzemon [When Digivolving] effect:")
        await self.when_digivolving_when_attacking_effect(ws)
    
    async def when_attacking_effect(self, ws):
        await self.bot.send_message(ws, f"EX2-044 Beelzemon [When Attacking] effect:")
        await self.when_digivolving_when_attacking_effect(ws)
