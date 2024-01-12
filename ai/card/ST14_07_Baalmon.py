import time

from Card import Card


class ST14_07_Baalmon(Card):

    def __init__(self, bot, game, **kwargs):
        self.bot = bot
        self.game = game
        self.extra_args = kwargs
    
    async def on_deletion_effect(self, ws, digimon_index):
        if len(self.game['player2Trash']) >= 10:
            self.st14_07_baalmon_baalmon_deleted_strategy(ws, digimon_index)

    ## TODO: Can target strategy to 
    async def when_digivolving_effect(self, ws):
        trashed_cards = []
        for i in range(3):
            if len(self.game['player2DeckField']) > 0:
                time.sleep(0.3)
                trashed_cards.append(self.bot.trash_top_card_of_deck(ws))
        for trashed_card in trashed_card:
            card_obj = self.bot.card_factory.get_card(trashed_card['uniqueCardNumber'])
            card_obj.when_trashed_effect(ws)
        self.bot['endOfOpponentTurnEffects']['player2Digi'][self.extra_args['digimon_index']].append(self.on_deletion_effect(ws, self.extra_args['digimon_index']))
