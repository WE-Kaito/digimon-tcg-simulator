import json
import time
import websockets

from Bot import Bot

class RedHybridBot(Bot):        
    
    def __init__(self, username):
        super().__init__(username)

    def mulligan_strategy():


    async def play(self, opponent):
        game = f'{opponent}‗{self.username}'
        async with websockets.connect(self.game_ws, extra_headers=[('Cookie', self.headers['Cookie'])]) as ws:
            await ws.send(f'/startGame:{game}')
            while True:
                message = await ws.recv()
                print(f"Received: {message}")
                if message.startswith('[START_GAME]:'):
                    await self.hi(ws, game, message)
                if message.startswith('[DISTRIBUTE_CARDS]:'):
                    distributed_cards = json.loads(message)
                    self.hand = distributed_cards['player1Hand']
                    await self.mulligan(ws, game)
