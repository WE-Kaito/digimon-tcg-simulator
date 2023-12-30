import time
from pprint import pprint

import websockets

from Bot import Bot

class BeelzemonXBot(Bot):
    
    def __init__(self, username):
        super().__init__(username)
  
    def mulligan_strategy(self):
        for card in self.game['player2Hand']:
            if card['cardType'] == 'Digimon' and card['level'] == 3:
                return False
        return True
        
    def not_egg_in_breeding_and_can_digivolve(self):
        not_egg = False
        has_digivolution_in_hand = False
        breeding = self.breeding_area[0]
        if breeding['level'] != 2:
            not_egg = True
        else:
            return False
        target_level = breeding['level'] + 1
        for i in range(len(self.game['player2Hand'])):
            if self.game['player2Hand'][i].card['level'] == target_level:
                has_digivolution_in_hand = True
                break
        return not_egg and has_digivolution_in_hand

    async def breeding_phase_strategy(self, ws):
        if len(self.breeding_area) == 0:
            await self.hatch(ws)
        elif self.not_egg_in_breeding_and_can_digivolve():
            await self.promote(ws)
    
    async def main_phase_strategy(self, ws):
        print('hi')
    
    async def end_turn(self, ws):
        await self.send_game_chat_message(ws, 'I end my turn!')
        if self.first_turn:
            self.first_turn = False
        self.my_turn = False
    
    async def turn(self, ws):
        # Unsuspend phase

        # Draw phase
        if not self.first_turn:
            await self.draw(ws, 1)
        
        # Breeding phase
        await self.breeding_phase_strategy(ws)

        # Main phase
        await self.main_phase_strategy(ws)

        # End turn
        await self.end_turn(ws)

        time.sleep(1)
