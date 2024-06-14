import asyncio
import time

from card.Card import Card


class ST14_01_Yaamon(Card):

    async def inherited_when_attacking_once_per_turn(self, ws):
        await super().animate_effect(ws)
        attacking_digimon = self.extra_args['attacking_digimon']
        if 'Evil' in attacking_digimon['digiType'] or 'Wizard' in attacking_digimon['digiType'] or 'Demon Lord' in attacking_digimon['digiType']:
            await self.bot.send_message(ws, 'ST14-01 Yaamon inherited effect: I trash the top 2 cards of my deck.')
            await self.bot.trash_top_cards_of_deck(ws, 2)
