import json
from pprint import pprint

import websockets

from Bot import Bot

class RedHybridBot(Bot):        
    
    def __init__(self, username):
        super().__init__(username)
  
    def mulligan_strategy(self):
        for card in self.game['player2Hand']:
            if card['type'] == 'Digimon' and card['level'] == 3:
                return False
        return True
    
    async def turn(self, ws):
        self.game['player2Digi'][3] = self.game['player2Hand'].pop(0)
        await self.move_card(ws, 'myHand0', 'myDigi3')
        await self.send_game_chat_message(ws, 'I end my turn!')
        self.my_turn = False
    
    