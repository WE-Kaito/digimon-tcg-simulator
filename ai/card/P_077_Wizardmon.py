from card.Card import Card


class P_077_Wizardmon(Card):

    async def when_trashed_effect(self, ws):
        await self.bot.send_message(ws, f"P-077 Wizardmon when trashed effect: Gain 1 memory")
        await self.bot.increase_memory_by(ws, 1)

    async def inherited_when_attacking_once_per_turn(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'P-077 Wizardmon inherited effect:')
        await self.bot.p_077_inherited_when_attacking_once_per_turn_strategy(ws)

