import logging
from abc import ABC

from decouple import config

class Card(ABC):

    def __init__(self):
        self.logger = logging.getLogger(__class__.__name__)
        self.logger.setLevel(config('LOGLEVEL'))
        fmt = '%(asctime)s %(filename)-18s %(levelname)-8s: %(message)s'
        fmt_date = '%Y-%m-%dT%T%Z'
        formatter = logging.Formatter(fmt, fmt_date)
        handler = logging.StreamHandler()
        handler.setFormatter(formatter)
        self.logger.addHandler(handler)
    
    async def main_effect(self, ws):
        pass

    async def on_play_effect(self, ws):
        pass
    
    async def when_attacking_effect(self, ws):
        pass

    async def when_digivolving_effect(self, ws):
        pass

    async def when_trashed_effect(self, ws):
        pass
    
    async def on_deletion_effect(self, ws):
        pass

    async def your_turn_effect(self, ws):
        pass

    async def all_turns_effect(self, ws):
        pass

    async def trash_effect(self, ws):
        pass

    async def inherited_when_attacking_once_per_turn(self, ws):
        pass
