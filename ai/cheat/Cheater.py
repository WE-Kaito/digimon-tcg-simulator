import logging

from decouple import config


class Cheater():

    def __init__(self, bot):
        self.bot = bot
        
        self.logger = logging.getLogger(__class__.__name__)
        self.logger.setLevel(config('LOGLEVEL'))
        fmt = '%(asctime)s %(filename)-10s %(levelname)-8s: %(message)s'
        fmt_date = '%Y-%m-%dT%T%Z'
        formatter = logging.Formatter(fmt, fmt_date)
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    async def get_card_from_deck_in_hand(self, ws, unique_card_number, card_name):
        card_index = None
        self.logger.info(f'Retrieving card from deck: {unique_card_number} {card_name}')
        for i in range(len(self.bot.game['player2DeckField'])):
            card = self.bot.game['player2DeckField'][i]
            if card['name'] == card_name and unique_card_number == card['uniqueCardNumber']:
                card_index = i
                break
        if card_index is None:
            self.logger.info('Could not find card when cheating.')
            return
        self.bot.game['player2Hand'].append(self.bot.game['player2DeckField'].pop(card_index))
        await self.bot.update_game(ws)
    
    async def trash_all_cards_from_hand(self, ws):
        self.logger.info('Trashing all cards from hand.')
        for i in range(len(self.bot.game['player2Hand'])):
            await self.bot.trash_card_from_hand(ws, 0)
