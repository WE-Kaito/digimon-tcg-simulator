from card.Card import Card


class P_077_Wizardmon(Card):

    def __init__(self, bot, **kwargs):
        self.bot = bot
        self.extra_args = kwargs

    async def when_trashed_effect(self, ws):
        await self.bot.increase_memory_by(ws, 1)
    
    async def when_digivolving_effect(self, ws):
        await self.bot.increase_memory_by(ws, 1)

    async def inherited_when_attacking_once_per_turn(self, ws):
        self.bot.p_077_inherited_when_attacking_once_per_turn_strategy(ws)

