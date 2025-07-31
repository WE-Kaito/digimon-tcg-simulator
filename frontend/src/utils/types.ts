export type CardType = {
    uniqueCardNumber: string;
    name: string;
    imgUrl: string;
    cardType: string;
    color: string[];
    attribute?: string;
    cardNumber: string;
    digivolveConditions?: DigivolveCondition[];
    specialDigivolve?: string;
    stage?: string;
    digiType?: string[];
    dp?: number;
    playCost?: number;
    level?: number;
    mainEffect?: string;
    inheritedEffect?: string;
    aceEffect?: string;
    burstDigivolve?: string;
    digiXros?: string;
    dnaDigivolve?: string;
    securityEffect?: string;
    rule?: string;
    linkDP?: number;
    linkEffect?: string;
    linkRequirement?: string;
    assemblyEffect?: string;
    restrictions: Restrictions;
    illustrator: string;
};

type DigivolveCondition = {
    color: string;
    cost: number;
    level: number;
};

export type CardTypeWithId = CardType & { id: string };

export type CardTypeGame = CardTypeWithId & { modifiers: CardModifiers; isTilted: boolean; isFaceUp: boolean };

export type CardModifiers = {
    plusDp: number;
    plusSecurityAttacks: number;
    keywords: string[];
    colors: string[];
};

type Restrictions = {
    chinese: string;
    english: string;
    japanese: string;
    korean: string;
};

export type SearchCards = (
    name: string | null,
    cardType: string | null,
    color: string | null,
    color2: string | null,
    color3: string | null,
    attribute: string | null,
    cardNumber: string | null,
    stage: string | null,
    digiType: string | null,
    dp: number | null,
    playCost: number | null,
    digivolutionCost: number | null,
    level: number | null,
    illustrator: string | null,
    effect: string | null,
    ace: boolean,
    altArtsEnabled: boolean
) => void;

export type DeckType = {
    id: string;
    name: string;
    decklist: string[];
    deckImageCardUrl: string;
    isAllowed_en: boolean | undefined;
    isAllowed_jp: boolean | undefined;
    sleeveName: string;
};

export type Player = {
    username: string;
    avatarName: string;
    sleeveName: string;
};

export type GameDistribution = {
    player1Hand: CardTypeGame[];
    player1DeckField: CardTypeGame[];
    player1EggDeck: CardTypeGame[];
    player1Trash?: CardTypeGame[];
    player1Security: CardTypeGame[];

    player1Digi1?: CardTypeGame[];
    player1Digi2?: CardTypeGame[];
    player1Digi3?: CardTypeGame[];
    player1Digi4?: CardTypeGame[];
    player1Digi5?: CardTypeGame[];
    player1Digi6?: CardTypeGame[];
    player1Digi7?: CardTypeGame[];
    player1Digi8?: CardTypeGame[];
    player1Digi9?: CardTypeGame[];
    player1Digi10?: CardTypeGame[];
    player1Digi11?: CardTypeGame[];
    player1Digi12?: CardTypeGame[];
    player1Digi13?: CardTypeGame[];
    player1BreedingArea?: CardTypeGame[];

    player1Link1?: CardTypeGame[];
    player1Link2?: CardTypeGame[];
    player1Link3?: CardTypeGame[];
    player1Link4?: CardTypeGame[];
    player1Link5?: CardTypeGame[];
    player1Link6?: CardTypeGame[];
    player1Link7?: CardTypeGame[];
    player1Link8?: CardTypeGame[];

    player2Hand: CardTypeGame[];
    player2DeckField: CardTypeGame[];
    player2EggDeck: CardTypeGame[];
    player2Trash?: CardTypeGame[];
    player2Security: CardTypeGame[];

    player2Digi1?: CardTypeGame[];
    player2Digi2?: CardTypeGame[];
    player2Digi3?: CardTypeGame[];
    player2Digi4?: CardTypeGame[];
    player2Digi5?: CardTypeGame[];
    player2Digi6?: CardTypeGame[];
    player2Digi7?: CardTypeGame[];
    player2Digi8?: CardTypeGame[];
    player2Digi9?: CardTypeGame[];
    player2Digi10?: CardTypeGame[];
    player2Digi11?: CardTypeGame[];
    player2Digi12?: CardTypeGame[];
    player2Digi13?: CardTypeGame[];
    player2BreedingArea?: CardTypeGame[];

    player2Link1?: CardTypeGame[];
    player2Link2?: CardTypeGame[];
    player2Link3?: CardTypeGame[];
    player2Link4?: CardTypeGame[];
    player2Link5?: CardTypeGame[];
    player2Link6?: CardTypeGame[];
    player2Link7?: CardTypeGame[];
    player2Link8?: CardTypeGame[];
};

export type OneSideDistribution = {
    playerReveal?: CardTypeGame[];

    playerHand: CardTypeGame[];
    playerDeckField: CardTypeGame[];
    playerEggDeck: CardTypeGame[];
    playerTrash?: CardTypeGame[];
    playerSecurity: CardTypeGame[];

    playerDigi1?: CardTypeGame[];
    playerDigi2?: CardTypeGame[];
    playerDigi3?: CardTypeGame[];
    playerDigi4?: CardTypeGame[];
    playerDigi5?: CardTypeGame[];
    playerDigi6?: CardTypeGame[];
    playerDigi7?: CardTypeGame[];
    playerDigi8?: CardTypeGame[];
    playerDigi9?: CardTypeGame[];
    playerDigi10?: CardTypeGame[];
    playerDigi11?: CardTypeGame[];
    playerDigi12?: CardTypeGame[];
    playerDigi13?: CardTypeGame[];
    playerDigi14?: CardTypeGame[];
    playerDigi15?: CardTypeGame[];
    playerDigi16?: CardTypeGame[];
    playerDigi17?: CardTypeGame[];
    playerDigi18?: CardTypeGame[];
    playerDigi19?: CardTypeGame[];
    playerDigi20?: CardTypeGame[];
    playerDigi21?: CardTypeGame[];
    playerBreedingArea?: CardTypeGame[];

    playerLink1?: CardTypeGame[];
    playerLink2?: CardTypeGame[];
    playerLink3?: CardTypeGame[];
    playerLink4?: CardTypeGame[];
    playerLink5?: CardTypeGame[];
    playerLink6?: CardTypeGame[];
    playerLink7?: CardTypeGame[];
    playerLink8?: CardTypeGame[];
    playerLink9?: CardTypeGame[];
    playerLink10?: CardTypeGame[];
    playerLink11?: CardTypeGame[];
    playerLink12?: CardTypeGame[];
    playerLink13?: CardTypeGame[];
    playerLink14?: CardTypeGame[];
    playerLink15?: CardTypeGame[];
    playerLink16?: CardTypeGame[];

    playerMemory?: number;
    playerPhase?: Phase;
    isPlayerTurn?: boolean;
};

export type DraggedItem = {
    id: string;
    location: string;
    cardnumber: string;
    type: string;
    name: string;
    isFaceUp: boolean;
    imgSrc: string;
};

export type DraggedStack = {
    location: string;
    cards: CardTypeGame[];
};

export type FieldCardContextMenuItemProps = {
    index: number;
    location: string;
    id: string;
    name: string;
};

export type Picture = {
    name: string;
    imagePath: string;
    artist: string;
};

export enum Phase {
    UNSUSPEND = "UNSUSPEND",
    DRAW = "DRAW",
    BREEDING = "BREEDING",
    MAIN = "MAIN",
}

export enum AttackPhase {
    WHEN_ATTACKING = "WHEN ATTACKING",
    COUNTER_BLOCK = "COUNTER ＋ BLOCK",
    RESOLVE_ATTACK = "RESOLVE ATTACK",
}

export enum BootStage {
    CLEAR = 0,
    SHOW_STARTING_PLAYER = 1,
    MULLIGAN = 2,
    MULLIGAN_DONE = 3,
    GAME_IN_PROGRESS = 4,
}

export type BoardState = {
    myMemory: number;
    myReveal: CardTypeGame[];

    myHand: CardTypeGame[];
    myDeckField: CardTypeGame[];
    myEggDeck: CardTypeGame[];
    myTrash: CardTypeGame[];
    mySecurity: CardTypeGame[];

    myDigi1: CardTypeGame[];
    myDigi2: CardTypeGame[];
    myDigi3: CardTypeGame[];
    myDigi4: CardTypeGame[];
    myDigi5: CardTypeGame[];
    myDigi6: CardTypeGame[];
    myDigi7: CardTypeGame[];
    myDigi8: CardTypeGame[];
    myDigi9: CardTypeGame[];
    myDigi10: CardTypeGame[];
    myDigi11: CardTypeGame[];
    myDigi12: CardTypeGame[];
    myDigi13: CardTypeGame[];
    myDigi14: CardTypeGame[];
    myDigi15: CardTypeGame[];
    myDigi16: CardTypeGame[];
    myDigi17: CardTypeGame[];
    myDigi18: CardTypeGame[];
    myDigi19: CardTypeGame[];
    myDigi20: CardTypeGame[];
    myDigi21: CardTypeGame[];
    myBreedingArea: CardTypeGame[];

    myLink1: CardTypeGame[];
    myLink2: CardTypeGame[];
    myLink3: CardTypeGame[];
    myLink4: CardTypeGame[];
    myLink5: CardTypeGame[];
    myLink6: CardTypeGame[];
    myLink7: CardTypeGame[];
    myLink8: CardTypeGame[];
    myLink9: CardTypeGame[];
    myLink10: CardTypeGame[];
    myLink11: CardTypeGame[];
    myLink12: CardTypeGame[];
    myLink13: CardTypeGame[];
    myLink14: CardTypeGame[];
    myLink15: CardTypeGame[];
    myLink16: CardTypeGame[];

    opponentMemory: number;
    opponentReveal: CardTypeGame[];

    opponentHand: CardTypeGame[];
    opponentDeckField: CardTypeGame[];
    opponentEggDeck: CardTypeGame[];
    opponentTrash: CardTypeGame[];
    opponentSecurity: CardTypeGame[];

    opponentDigi1: CardTypeGame[];
    opponentDigi2: CardTypeGame[];
    opponentDigi3: CardTypeGame[];
    opponentDigi4: CardTypeGame[];
    opponentDigi5: CardTypeGame[];
    opponentDigi6: CardTypeGame[];
    opponentDigi7: CardTypeGame[];
    opponentDigi8: CardTypeGame[];
    opponentDigi9: CardTypeGame[];
    opponentDigi10: CardTypeGame[];
    opponentDigi11: CardTypeGame[];
    opponentDigi12: CardTypeGame[];
    opponentDigi13: CardTypeGame[];
    opponentDigi14: CardTypeGame[];
    opponentDigi15: CardTypeGame[];
    opponentDigi16: CardTypeGame[];
    opponentDigi17: CardTypeGame[];
    opponentDigi18: CardTypeGame[];
    opponentDigi19: CardTypeGame[];
    opponentDigi20: CardTypeGame[];
    opponentDigi21: CardTypeGame[];
    opponentBreedingArea: CardTypeGame[];

    opponentLink1: CardTypeGame[];
    opponentLink2: CardTypeGame[];
    opponentLink3: CardTypeGame[];
    opponentLink4: CardTypeGame[];
    opponentLink5: CardTypeGame[];
    opponentLink6: CardTypeGame[];
    opponentLink7: CardTypeGame[];
    opponentLink8: CardTypeGame[];
    opponentLink9: CardTypeGame[];
    opponentLink10: CardTypeGame[];
    opponentLink11: CardTypeGame[];
    opponentLink12: CardTypeGame[];
    opponentLink13: CardTypeGame[];
    opponentLink14: CardTypeGame[];
    opponentLink15: CardTypeGame[];
    opponentLink16: CardTypeGame[];
};

export type SendToStackFunction = (
    topOrBottom: "Top" | "Bottom",
    cardId: string,
    cardLocation: string,
    to: string,
    facing?: "up" | "down"
) => void;

export enum SIDE {
    MY = "my",
    OPPONENT = "opponent",
}

export const tamerLocations = [
    "myDigi1",
    "myDigi2",
    "myDigi3",
    "myDigi4",
    "myDigi5",
    "myDigi6",
    "myDigi7",
    "myDigi8",
    "myDigi9",
    "myDigi10",
    "myDigi11",
    "myDigi12",
    "myDigi13",
    "myDigi14",
    "myDigi15",
    "myDigi16",
    "myDigi17",
    "myDigi18",
    "myDigi19",
    "myDigi20",
    "myDigi21",
    "myBreedingArea",
    "opponentDigi1",
    "opponentDigi2",
    "opponentDigi3",
    "opponentDigi4",
    "opponentDigi5",
    "opponentDigi6",
    "opponentDigi7",
    "opponentDigi8",
    "opponentDigi9",
    "opponentDigi10",
    "opponentDigi11",
    "opponentDigi12",
    "opponentDigi13",
    "opponentDigi14",
    "opponentDigi15",
    "opponentDigi16",
    "opponentDigi17",
    "opponentDigi18",
    "opponentDigi19",
    "opponentDigi20",
    "opponentDigi21",
    "opponentBreedingArea",
] as const;
