from Card import Card


class ST14_02_Impmon(Card):

    def __init__(self, bot, game, **kwargs):
        self.bot = bot
        self.game = game
        self.extra_args = kwargs

    async def when_attacking_effect(self, ws):
        if len(self.game['player2Trash']) >= 20:
            for i in range(self.game['player2Trash']):
                card = self.game['player2Trash'][i]
                if card['name'] == 'Beelzemon':
                    self.bot.st14_02_impmon_strategy(ws, self.card_index, self.extra_args['digimon_index'])

