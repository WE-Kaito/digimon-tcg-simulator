import P_040_PurpleMemoryBoost
import P_077_Wizardmon
import ST14_06_Witchmon
import EX2_039_Impmon

class CardFactory():

    def __init__(self, bot, game):
        self.cards =  {
            'P-040': P_040_PurpleMemoryBoost,
            'P-077': P_077_Wizardmon,
            'ST14-06': ST14_06_Witchmon,
            'EX2-039': EX2_039_Impmon
        }
    
    def get_card(self, unique_card_number):
        return self.cards[unique_card_number](self.bot, self.game)
