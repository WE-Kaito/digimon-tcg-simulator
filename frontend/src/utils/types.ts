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
