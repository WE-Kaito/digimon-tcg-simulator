import asyncio
import math
import time

from card.Card import Card


class ST14_08_Beelzemon(Card):

    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        await super().animate_effect(ws)
        trashed_cards = []
        await self.bot.send_message(ws, 'ST14-08 Beelzemon [When Digivolving] effect: I trash the top 4 cards of my deck.')
        await self.bot.trash_top_cards_of_deck(ws, 4)
    
    async def all_turns_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'ST14-08 Beelzemon [All turns effect] effect: when a cards is trashed')
        memory_increase = math.floor(len(self.bot.game['player2Trash']) / 10)
        await self.bot.send_message(ws, f'Gain {memory_increase} memory.')
        await self.bot.increase_memory_by(ws, memory_increase)
    
    async def your_turn_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'ST14-08 Beelzemon [Your turn] effect: when a card gets trashed, gain [Security attack +1]')
        self.bot.effects['endOfTurnEffects']['player2Digi'][self.extra_args['digimon_index']].append('Security attack +1')
