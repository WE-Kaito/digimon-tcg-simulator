from card.Card import Card


class ST14_02_Impmon(Card):

    def __init__(self, bot, **kwargs):
        super().__init__()
        self.bot = bot
        self.extra_args = kwargs

    async def when_attacking_effect(self, ws):
        if len(self.bot.game['player2Trash']) >= 20:
            for i in range(self.bot.game['player2Trash']):
                card = self.bot.game['player2Trash'][i]
                if card['name'] == 'Beelzemon':
                    await self.bot.st14_02_impmon_strategy(ws, self.card_index, self.extra_args['digimon_index'])

