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
    
    def digimon_of_level_in_hand(self, level):
        for i in range(len(self.game['player2Hand'])):
            card = self.game['player2Hand'][i]
            if card['cardType'] == 'Digimon' and card['level'] == level:
                return i
        return None
    
    def memory_boost_in_hand(self):
        for i in range(len(self.game['player2Hand'][i])):
            card = self.game['player2Hand'][i]
            if card['cardType']== 'Option' and card['name'] == 'Purple Memory Boost':
                return i
        return None
        
    def not_egg_in_breeding_and_can_digivolve(self):
        not_egg = False
        has_digivolution_in_hand = False
        breeding = self.game['player2BreedingArea'][0]
        if breeding['level'] != 2:
            not_egg = True
        else:
            return False
        target_level = breeding['level'] + 1
        for i in range(len(self.game['player2Hand'])):
            if self.game['player2Hand'][i]['level'] == target_level:
                has_digivolution_in_hand = True
                break
        return not_egg and has_digivolution_in_hand

    async def breeding_phase_strategy(self, ws):
        if len(self.game['player2BreedingArea']) == 0:
            await self.hatch(ws)
        elif self.not_egg_in_breeding_and_can_digivolve():
            await self.promote(ws)

    async def prepare_rookies(self, ws):
        rookie_in_hand_index = self.digimon_of_level_in_hand(3)
        if rookie_in_hand_index is not None:
            await self.digivolve(ws, 'BreedingArea', 'Hand', rookie_in_hand_index)
    
    async def avoid_brick(self, ws):
        memory_boost_in_hand_index = self.memory_boost_in_hand()
        if memory_boost_in_hand_index is not None:
            self.play_card()
        
    
    async def main_phase_strategy(self, ws):
        await self.prepare_rookies(ws)
        # self.avoid_brick(ws)
    
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
