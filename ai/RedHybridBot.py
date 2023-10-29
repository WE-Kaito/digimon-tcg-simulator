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
        if not self.first_turn:
            await self.draw(ws, 1)
        if len(self.breeding_area) == 0:
            await self.hatch(ws)
        import time
        time.sleep(1)
        card = self.game['player2Hand'].pop(0)
        self.game['player2Digi'][3] = card
        await self.set_memory(ws, f"-{card['play_cost']}")
        print(f"HAND: {len(self.game['player2Hand'])}")
        await self.move_card(ws, 'myHand0', 'myDigi3')
        await self.send_game_chat_message(ws, 'I end my turn!')
        if self.first_turn:
            self.first_turn = False
        self.my_turn = False
    
    