import math
import time

from card.Card import Card


class ST14_08_Beelzemon(Card):

    def __init__(self, bot, **kwargs):
        self.bot = bot
        self.extra_args = kwargs

    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        trashed_cards = []
        for i in range(4):
            if len(self.bot.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(self.bot.trash_top_card_of_deck(ws))
        for trashed_card in trashed_card:
            card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'])
            await card_obj.when_trashed_effect(ws)
        self.bot['endOfOpponentEffects']['player2Digi'][self.extra_args['digimon_index']] = self.on_deletion_effect(ws, self.extra_args['digimon_index'])
    
    async def all_turns_effect(self, ws):
        await self.bot.increase_memory_by(ws, math.floor(len(self.bot.game['player2Trash'])/10))
    
    async def turn_effect(self):
        self.bot.effects['endOfTurnEffects']['player2Digi'][self.extra_args['digimon_index']].append('Security attack +1')
