import json
from pprint import pprint

import websockets

from Bot import Bot

class RedHybridBot(Bot):        
    
    def __init__(self, username):
        super().__init__(username)

    
    # async def turn():

    
    def mulligan_strategy(self):
        for card in self.game['player2Hand']:
            if card['type'] == 'Digimon' and card['level'] == 3:
                return False
        return True
    
    async def play(self, opponent):
        game_name = f'{opponent}‗{self.username}'
        async with websockets.connect(self.game_ws, extra_headers=[('Cookie', self.headers['Cookie'])]) as ws:
            await ws.send(f'/startGame:{game_name}')
            opponent_ready = False
            done_mulligan = False
            while True:
                ws.send(f'/heartbeat/')
                message = await ws.recv()
                pprint(f"Received: {message}")
                if message.startswith('[START_GAME]:'):
                    await self.hi(ws, game_name, message)
                if message.startswith('[DISTRIBUTE_CARDS]:'):
                    self.game= json.loads(message.removeprefix('[DISTRIBUTE_CARDS]:'))
                    if not done_mulligan:
                        if self.mulligan_strategy():
                            await self.mulligan(ws, game_name, opponent)
                            await self.send_game_chat_message(ws, game_name, opponent, 'I mulligan my hand')
                        else:
                            await self.send_game_chat_message(ws, game_name, opponent, 'I keep my hand')
                        await self.send_game_command(ws, game_name, f'/playerReady:{opponent}')
                        done_mulligan = True
                if message.startswith('[STARTING_PLAYER]:'):
                    starting_player = message.removeprefix('[STARTING_PLAYER]:')
                    if starting_player == self.username:
                       self.my_turn = True
                if message.startswith('[PLAYER_READY]'):
                    opponent_ready = True
                # if self.my_turn and opponent_ready:
                #     await self.turn()

                
                
