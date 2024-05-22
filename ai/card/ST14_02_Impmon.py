from card.Card import Card


class ST14_02_Impmon(Card):

    async def when_attacking_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'ST14-02 Impmon [When Attacking] effect:')
        if len(self.bot.game['player2Trash']) >= 20:
            for i in range(self.bot.game['player2Trash']):
                card = self.bot.game['player2Trash'][i]
                if card['name'] == 'Beelzemon':
                    await self.bot.st14_02_impmon_strategy(ws, self.card_index, self.extra_args['digimon_index'])
        else:
            await self.bot.send_message(ws, 'Not enough cards in trash.')
    
    async def inherited_your_turn_effect(self, ws):
        await super().animate_effect(ws)
        await self.bot.send_message(ws, 'ST14-02 Impmon [When Attacking] effect:')
        for i in range(len(self.bot.game['player1Digi'])):
            if len(self.bot.game['player1Digi'][i]) > 0:
                card = self.bot.game['player1Digi'][i][-1]
                if card['level'] == 3:
                    await self.bot.delete_card_from_opponent_battle_area(ws, i)
                    break
