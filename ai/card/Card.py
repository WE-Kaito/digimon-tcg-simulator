from abc import ABC

class Card(ABC):
    
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
