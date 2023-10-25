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
    
    async def play(self):
        self.game_name = f'{self.opponent}‗{self.username}'
        async with websockets.connect(self.game_ws, extra_headers=[('Cookie', self.headers['Cookie'])]) as ws:
            await ws.send(f'/startGame:{self.game_name}')
            opponent_ready = False
            done_mulligan = False
            while True:
                ws.send(f'/heartbeat/')
                message = await ws.recv()
                pprint(f"Received: {message}")
                if message.startswith('[START_GAME]:'):
                    await self.hi(ws, message)
                if message.startswith('[DISTRIBUTE_CARDS]:'):
                    self.initialize_game(json.loads(message.removeprefix('[DISTRIBUTE_CARDS]:')))
                    if not done_mulligan:
                        if self.mulligan_strategy():
                            await self.mulligan(ws)
                            await self.send_game_chat_message(ws, 'I mulligan my hand')
                        else:
                            await self.send_game_chat_message(ws, 'I keep my hand')
                        await self.send_player_ready(ws)
                        done_mulligan = True
                if message.startswith('[STARTING_PLAYER]:'):
                    starting_player = message.removeprefix('[STARTING_PLAYER]:')
                    if starting_player == self.username:
                       self.my_turn = True
                if message.startswith('[PLAYER_READY]'):
                    opponent_ready = True
                if message.startswith(f'[CHAT_MESSAGE]:{self.opponent}﹕Done'):
                    self.my_turn = True
                if self.my_turn and opponent_ready:
                    await self.turn(ws)
