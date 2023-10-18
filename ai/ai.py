import json
import time
import asyncio
import requests

from decouple import config
import websockets


s = requests.Session()
s.get('http://localhost:8080/api/user/me', auth=(config('BOT_USERNAME'), config('BOT_PASSWORD')))
cookies = s.cookies.get_dict()
print(s.get('http://localhost:8080/api/user/me').text)
print(s.get('http://localhost:8080/lobby', auth=(config('BOT_USERNAME'),config('BOT_PASSWORD'))))
async def main():
    async with websockets.connect(
        "ws://localhost:8080/api/ws/chat",
        extra_headers=[('Cookie', f"JSESSIONID={cookies['JSESSIONID']}; XSRF-TOKEN={cookies['XSRF-TOKEN']}")]) as ws:
        await ws.send("I'm the first bot working here!")
asyncio.run(main())