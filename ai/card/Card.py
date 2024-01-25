from abc import ABC

class Card(ABC):
    
    def main_effect():
        pass

    def on_play_effect():
        pass
    
    def when_attacking_effect():
        pass

    def when_digivolving_effect():
        pass

    def when_trashed_effect():
        pass
    
    def on_deletion_effect():
        pass

    def your_turn_effect():
        pass

    def all_turns_effect():
        pass

    def trash_effect():
        pass
