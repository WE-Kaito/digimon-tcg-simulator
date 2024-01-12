from Card import Card


class P_077_Wizardmon(Card):

    def __init__(self, bot, game):
        self.bot = bot
        self.game = game

    async def when_trashed_effect(self, ws):
        self.bot.increase_memory_by(ws, 1)

