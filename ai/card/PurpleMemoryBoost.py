class PurpleMemoryBoost():

    def __init__(self, bot, game):
        self.bot = bot
        self.game = game

    async def main_effect(self, ws, search_by_levels=None):
        await self.bot.reveal_top_from_deck(ws, 4)
        if search_by_levels is not None:
            candidates = []
            digimon = []
            for i in range(len(self.game['player2Reveal'])):
                card = self.game['player2Reveal'][i]
                if card['cardType'] == 'Digimon':
                    digimon.append(i)
                    if card['cardType'] == 'Digimon' and 'Purple' in card['color'] and card['level'] in search_by_levels:
                        candidates.append((card['level'], i))
            if len(digimon) == 0:
                return
            if len(candidates) == 0:
                card_index = digimon[0]
            else:
                print(candidates)
                card_index = min(candidates)[1]
            await self.bot.move_card(ws, f'myReveal{card_index}', f'myHand')
            self.game['player2Hand'].append(self.game['player2Reveal'].pop(card_index))