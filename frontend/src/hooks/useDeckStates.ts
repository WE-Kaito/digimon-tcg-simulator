import { create } from "zustand/index";
import { notifyError, notifySuccess } from "../utils/toasts.ts";
import axios from "axios";
import { CardType, CardTypeWithId, DeckType, SearchCards } from "../utils/types.ts";
import { generalToken } from "../utils/tokens.ts";
import { uid } from "uid";
import { Dispatch, SetStateAction } from "react";
import { NavigateFunction } from "react-router-dom";
import cardBackSrc from "../assets/cardBack.jpg";

type State = {
    isLoading: boolean;
    isFilteringCards: boolean;
    isSaving: boolean;

    decks: DeckType[];
    orderedDecks: DeckType[];
    deckIdOrder: string[];

    fetchedCards: CardTypeWithId[];
    filteredCards: CardTypeWithId[];

    mainDeckCards: CardTypeWithId[];
    setMainDeckCards: (cards: CardTypeWithId[]) => void;

    eggDeckCards: CardTypeWithId[];
    setEggDeckCards: (cards: CardTypeWithId[]) => void;

    deckName: string;
    setDeckName: (deckName: string) => void;

    fetchCards: () => void;
    filterCards: SearchCards;

    isSettingDeck: boolean;
    setDeckById: (id: string) => void;

    addCardToDeck: (cardnumber: string, type: string, uniqueCardNumber: string) => void;
    deleteFromDeck: (id: string) => void;
    saveDeck: (name: string) => void;
    fetchDecks: () => void;
    updateDeck: (id: string, name: string) => void;
    deleteDeck: (id: string, navigate: NavigateFunction) => void;
    clearDeck: () => void;

    importDeck: (decklist: string | string[], format: string) => void;
    exportDeck: (exportFormat: string, deckname: string) => string;

    loadOrderedDecks: (setOrderedDecks: Dispatch<SetStateAction<DeckType[]>>) => void;
    setDeckIdOrder: (deckIdOrder: string[], setOrderedDecks: Dispatch<SetStateAction<DeckType[]>>) => void;
};

const fallbackCard = {
    ...generalToken,
    cardNumber: "1110101",
    uniqueCardNumber: "1110101",
    name: "Fallback Card",
    mainEffect: "If you see this card, the actual card was not found.",
};

export const cardsWithoutLimit: string[] = ["BT11-061", "EX2-046", "BT6-085", "BT22-079", "EX9-048", "EX11-027"]; // "Rule" effect

//workaround for double cards in fetchCardList
export function filterDoubleCardNumbers(cards: CardTypeWithId[]): CardTypeWithId[] {
    const uniqueCards = [];
    let prevCardNumber = null;
    for (const card of cards) {
        if (card.uniqueCardNumber !== prevCardNumber) {
            uniqueCards.push(card);
            prevCardNumber = card.uniqueCardNumber;
        }
    }
    return uniqueCards;
}

export function sortCards(deck: CardTypeWithId[]) {
    const newDeck = [...deck];
    newDeck.sort(compareCardNumbers);
    newDeck.sort(compareCardLevels);
    newDeck.sort(compareCardTypes);
    return newDeck;
}

function compareCardNumbers(a: CardTypeWithId, b: CardTypeWithId) {
    if (a.cardNumber < b.cardNumber) return -1;
    if (a.cardNumber > b.cardNumber) return 1;
    return 0;
}

function compareCardLevels(a: CardTypeWithId, b: CardTypeWithId) {
    if (a.level === null && b.level === null) return 0;
    if (a.level === null) return -1;
    if (b.level === null) return 1;
    if (a.level && b.level && a.level < b.level) return -1;
    if (a.level && b.level && a.level > b.level) return 1;
    return 0;
}

function compareCardTypes(a: CardTypeWithId, b: CardTypeWithId) {
    const typeOrder: { [key: string]: number } = {
        "Digi-Egg": 0,
        Option: 1,
        Tamer: 2,
        Digimon: 3,
    };
    const aTypeOrder = typeOrder[a.cardType];
    const bTypeOrder = typeOrder[b.cardType];

    if (aTypeOrder < bTypeOrder) return -1;
    if (aTypeOrder > bTypeOrder) return 1;

    return 0;
}

function compareEffectText(searchText: string, card: CardTypeWithId): boolean {
    const text = searchText.toUpperCase();

    const mainEffectMatch = card.mainEffect?.toUpperCase().includes(text) ?? false;
    const inheritedEffectMatch = card.inheritedEffect?.toUpperCase().includes(text) ?? false;
    const securityEffectMatch = card.securityEffect?.toUpperCase().includes(text) ?? false;
    const digivolveEffectMatch = card.specialDigivolve?.toUpperCase().includes(text) ?? false;
    const dnaEffectMatch = card.dnaDigivolve?.toUpperCase().includes(text) ?? false;
    const burstEffectMatch = card.burstDigivolve?.toUpperCase().includes(text) ?? false;
    const xrosEffectMatch = card.digiXros?.toUpperCase().includes(text) ?? false;
    const linkEffectMatch = card.linkEffect?.toUpperCase().includes(text) ?? false;
    const aceEffectMatch = card.aceEffect?.toUpperCase().includes(text) ?? false;
    const ruleEffectMatch = card.rule?.toUpperCase().includes(text) ?? false;
    const assemblyEffectMatch = card.assemblyEffect?.toUpperCase().includes(text) ?? false;

    return (
        mainEffectMatch ||
        inheritedEffectMatch ||
        securityEffectMatch ||
        digivolveEffectMatch ||
        dnaEffectMatch ||
        burstEffectMatch ||
        xrosEffectMatch ||
        linkEffectMatch ||
        aceEffectMatch ||
        ruleEffectMatch ||
        assemblyEffectMatch
    );
}

export const useDeckStates = create<State>((set, get) => ({
    isLoading: false,
    isFilteringCards: false,
    isSaving: false,
    isSettingDeck: false,

    decks: [],
    deckIdOrder: [],
    orderedDecks: [],

    fetchedCards: [],
    filteredCards: [],

    mainDeckCards: JSON.parse(localStorage.getItem("mainDeckCards") ?? "[]"),
    setMainDeckCards: (mainDeckCards) => {
        set({ mainDeckCards });
        localStorage.setItem("mainDeckCards", JSON.stringify(mainDeckCards));
    },

    eggDeckCards: JSON.parse(localStorage.getItem("eggDeckCards") ?? "[]"),
    setEggDeckCards: (eggDeckCards) => {
        set({ eggDeckCards });
        localStorage.setItem("eggDeckCards", JSON.stringify(eggDeckCards));
    },

    deckName: localStorage.getItem("deckName") ?? "New Deck",
    setDeckName: (deckName) => set({ deckName }),

    fetchDecks: () => {
        set({ isLoading: true });
        axios
            .get("/api/profile/decks")
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => {
                set({ decks: data });
            })
            .finally(() => set({ isLoading: false }));
    },

    loadOrderedDecks: (setOrderedDecks) => {
        set({ isLoading: true });
        axios
            .get("/api/profile/cards")
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => set({ fetchedCards: data.map((card: CardType) => ({ ...card, id: uid() })) }))
            .then(() =>
                axios
                    .get("/api/profile/decks")
                    .then((res) => res.data)
                    .catch(console.error)
                    .then((data) => set({ decks: data }))
            )
            .then(() => {
                const savedDeckIdOrder: string[] | null = JSON.parse(localStorage.getItem("deckIdOrder") ?? "null");
                set({ deckIdOrder: savedDeckIdOrder ?? get().decks.map((deck) => deck.id) });
            })
            .then(() => {
                const { decks, deckIdOrder } = get();

                const orderedDecks = deckIdOrder.flatMap((orderedId) => {
                    const foundDeck = decks.find((deck) => deck.id === orderedId);
                    return foundDeck ? [foundDeck] : [];
                });

                const newDecks = decks.filter((deck) => !deckIdOrder.includes(deck.id)); // look for new decks
                set({ deckIdOrder: [...deckIdOrder, ...newDecks.map((deck) => deck.id)] }); // add them to the order

                setOrderedDecks([...orderedDecks, ...newDecks]);
            })
            .finally(() => set({ isLoading: false }));
    },

    setDeckIdOrder: (deckIdOrder, setOrderedDecks) => {
        set({ deckIdOrder });
        localStorage.setItem("deckIdOrder", JSON.stringify(deckIdOrder));
        setOrderedDecks(
            deckIdOrder.flatMap((orderedId) => {
                const foundDeck = get().decks.find((deck) => deck.id === orderedId);
                return foundDeck ? [foundDeck] : [];
            })
        );
    },

    fetchCards: () => {
        set({ isLoading: true });
        axios
            .get("/api/profile/cards")
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => {
                const cardsWithId: CardTypeWithId[] = data.map((card: CardType) => ({
                    ...card,
                    id: uid(),
                }));
                set({
                    fetchedCards: cardsWithId,
                    filteredCards: cardsWithId,
                });
            })
            .finally(() => set({ isLoading: false }));
    },

    filterCards: (
        name,
        cardType,
        color,
        color2,
        color3,
        attribute,
        cardNumber,
        stage,
        digiType,
        dp,
        playCost,
        digivolutionCost,
        level,
        illustrator,
        effect,
        ace,
        altArtsEnabled
    ) => {
        set({ isLoading: true });

        let filteredData = get().fetchedCards;

        if (name) filteredData = filteredData.filter((card) => card.name.toUpperCase().includes(name.toUpperCase()));
        if (color) filteredData = filteredData.filter((card) => card.color.includes(color));
        if (color2) filteredData = filteredData.filter((card) => card.color.includes(color2));
        if (color3) filteredData = filteredData.filter((card) => card.color.includes(color3));
        if (cardType) filteredData = filteredData.filter((card) => card.cardType === cardType);
        if (stage) filteredData = filteredData.filter((card) => card.stage === stage);
        if (attribute) filteredData = filteredData.filter((card) => card.attribute === attribute);
        if (digiType)
            filteredData = filteredData.filter((card) =>
                card.digiType?.join(" ").toUpperCase().includes(digiType.toUpperCase())
            );
        if (dp) filteredData = filteredData.filter((card) => card.dp === dp);
        if (playCost) filteredData = filteredData.filter((card) => card.playCost === playCost);
        if (digivolutionCost)
            filteredData = filteredData.filter((card) =>
                card.digivolveConditions?.some((c) => c.cost === digivolutionCost)
            );
        if (level) filteredData = filteredData.filter((card) => card.level === level);
        if (cardNumber)
            filteredData = filteredData.filter((card) =>
                card.cardNumber.toUpperCase().includes(cardNumber.toUpperCase())
            );
        if (illustrator)
            filteredData = filteredData.filter((card) =>
                card.illustrator.toUpperCase().includes(illustrator.toUpperCase())
            );
        if (effect) filteredData = filteredData.filter((card) => compareEffectText(effect, card));
        if (ace) filteredData = filteredData.filter((card) => !!card.aceEffect);
        if (!altArtsEnabled)
            filteredData = filteredData.filter(
                (card) => !card.uniqueCardNumber.includes("_P") && !card.uniqueCardNumber.includes("-E")
            );
        filteredData = filterDoubleCardNumbers(filteredData); //bug quickfix
        console.log(filteredData.map((card) => card.uniqueCardNumber));
        set({ filteredCards: filteredData, isLoading: false });
    },

    addCardToDeck: (cardNumber, type, uniqueCardNumber) => {
        const cardToAdd = {
            ...get().fetchedCards.filter((card) => card.uniqueCardNumber === uniqueCardNumber)[0],
            id: uid(),
        };

        if (type === "Digi-Egg") {
            const eggDeckCards = get().eggDeckCards;
            const digiEggsInDeck = eggDeckCards.length;
            const cardOfIdInDeck = eggDeckCards.filter((card) => card.cardNumber === cardNumber).length;

            if (digiEggsInDeck >= 5 || cardOfIdInDeck >= 4) return;

            const newEggDeckCards = [cardToAdd, ...eggDeckCards];
            set({ eggDeckCards: newEggDeckCards });
            localStorage.setItem("eggDeckCards", JSON.stringify(newEggDeckCards));
        } else {
            const mainDeckCards = get().mainDeckCards;
            const filteredLength = mainDeckCards.length;
            const cardOfIdInDeck = mainDeckCards.filter((card) => card.cardNumber === cardNumber).length;

            if (filteredLength >= 50) return;

            if (!cardsWithoutLimit.includes(cardNumber) && cardOfIdInDeck >= 4) return;

            const newMainDeckCards = [cardToAdd, ...mainDeckCards];
            set({ mainDeckCards: newMainDeckCards });
            localStorage.setItem("mainDeckCards", JSON.stringify(newMainDeckCards));
        }
    },

    deleteFromDeck: (id) => {
        const mainDeckCards = get().mainDeckCards;
        const eggDeckCards = get().eggDeckCards;

        // Check if card is in main deck
        const cardInMain = mainDeckCards.find((card) => card.id === id);
        if (cardInMain) {
            const newMainDeckCards = mainDeckCards.filter((card) => card.id !== id);
            set({ mainDeckCards: newMainDeckCards });
            localStorage.setItem("mainDeckCards", JSON.stringify(newMainDeckCards));
            return;
        }

        // Check if card is in egg deck
        const cardInEgg = eggDeckCards.find((card) => card.id === id);
        if (cardInEgg) {
            const newEggDeckCards = eggDeckCards.filter((card) => card.id !== id);
            set({ eggDeckCards: newEggDeckCards });
            localStorage.setItem("eggDeckCards", JSON.stringify(newEggDeckCards));
        }
    },

    saveDeck: (name) => {
        const mainDeckCards = get().mainDeckCards;
        const eggDeckCards = get().eggDeckCards;

        set({ isSaving: true });

        const sortedMainDeck = sortCards(mainDeckCards);
        const sortedEggDeck = sortCards(eggDeckCards);

        const deckToSave = {
            name: name,
            mainDeckList: sortedMainDeck.map((card) => card.uniqueCardNumber),
            eggDeckList: sortedEggDeck.map((card) => card.uniqueCardNumber),
            deckImageCardUrl: sortedMainDeck.at(-1)?.imgUrl || sortedEggDeck.at(-1)?.imgUrl || cardBackSrc,
            mainSleeveName: "Default",
            eggSleeveName: "Default",
        };

        axios
            .post("/api/profile/decks", deckToSave)
            .then((res) => res.data)
            .catch((error) => {
                console.warn(error);
                notifyError(error.response.data.errors[0]?.defaultMessage || "Could not be saved");
                set({ isSaving: false });
                throw error;
            })
            .then(() => {
                notifySuccess("Deck saved!");
                get().fetchDecks();
                localStorage.removeItem("mainDeckCards");
                localStorage.removeItem("eggDeckCards");
                localStorage.removeItem("deckName");
                get().clearDeck();
                set({ isSaving: false });
            });
    },

    deleteDeck: (id, navigate) => {
        axios
            .delete(`/api/profile/decks/${id}`)
            .then((res) => res.data)
            .catch((error) => {
                console.error(error);
                notifyError("Could not be deleted");
                throw error;
            })
            .then(() => {
                navigate("/decks");
                set({ mainDeckCards: [], eggDeckCards: [] });
                notifySuccess("Deck deleted!");
            });
    },

    clearDeck: () => {
        set({ mainDeckCards: [], eggDeckCards: [], deckName: "New Deck" });
        localStorage.removeItem("mainDeckCards");
        localStorage.removeItem("eggDeckCards");
        localStorage.removeItem("deckName");
    },

    setDeckById: (id) => {
        set({ deckName: "", mainDeckCards: [], eggDeckCards: [], isSettingDeck: true });

        const deck = get().decks.find((deck) => deck.id === id);
        const fetchedCards = get().fetchedCards;
        if (!deck || !fetchedCards.length) return;

        const mainDeckCards = deck.mainDeckList.map((cardNumber) => {
            const card = fetchedCards.find((c) => c.uniqueCardNumber === cardNumber);
            return { ...(card ? card : fallbackCard), id: uid() } as CardTypeWithId;
        });

        const eggDeckCards = deck.eggDeckList.map((cardNumber) => {
            const card = fetchedCards.find((c) => c.uniqueCardNumber === cardNumber);
            return { ...(card ? card : fallbackCard), id: uid() } as CardTypeWithId;
        });

        set({ deckName: deck.name, mainDeckCards, eggDeckCards, isSettingDeck: false });
    },

    updateDeck: (id, name) => {
        const mainDeckCards = get().mainDeckCards;
        const eggDeckCards = get().eggDeckCards;

        const sortedMainDeck = sortCards(mainDeckCards);
        const sortedEggDeck = sortCards(eggDeckCards);
        const deckWithoutId = {
            name: name,
            mainDeckList: sortedMainDeck.map((card) => card.uniqueCardNumber),
            eggDeckList: sortedEggDeck.map((card) => card.uniqueCardNumber),
        };

        axios
            .put(`/api/profile/decks/${id}`, deckWithoutId)
            .then((res) => res.data)
            .catch((error) => {
                console.warn(error);
                notifyError(error.response.data.errors[0]?.defaultMessage || "Could not be saved");
                set({ isSaving: false });
                throw error;
            })
            .then(() => notifySuccess("Deck updated!"));
    },

    importDeck: (decklist, format) => {
        set({ isLoading: true });

        const constructedDecklist: string[] = [];

        if (format === "text") {
            (decklist as string).split("\n").forEach((line) => {
                if (line.startsWith("//")) {
                    get().setDeckName(line.replace("//", "").trim());
                    return;
                }
                const linesSplits = line.split(" ");
                if (linesSplits.length < 2 || !Number(linesSplits[0])) return;
                const amount = Number(linesSplits[0]);
                const cardnumber = linesSplits[linesSplits.length - 1];
                for (let i = 0; i < amount; i++) {
                    constructedDecklist.push(cardnumber);
                }
            });
        }

        const cardsWithId: CardTypeWithId[] = (format === "text" ? constructedDecklist : (decklist as string[]))
            .map((cardnumber: string) => ({
                ...get().fetchedCards.filter((card) => card.uniqueCardNumber === cardnumber)[0],
                id: uid(),
            }))
            .filter((card) => card.name !== undefined);

        // --- check if deck is valid ---
        const eggCardLength = cardsWithId.filter((card) => card.cardType === "Digi-Egg").length;
        const filteredLength = cardsWithId.length - eggCardLength;
        if (eggCardLength > 5 || filteredLength > 50) {
            notifyError("Deck exceeds card limits!");
            set({ isLoading: false });
            return;
        }

        for (const card of cardsWithId) {
            const cardOfIdInDeck = cardsWithId.filter((c) => c.cardNumber === card.cardNumber).length;
            if (cardOfIdInDeck > 4 && !cardsWithoutLimit.includes(card.cardNumber)) {
                notifyError("Too many copies of a single card!");
                set({ isLoading: false });
                return;
            }
        }
        // ---

        // Split cards by type into appropriate decks
        const mainDeckCards = cardsWithId.filter((card) => card.cardType !== "Digi-Egg");
        const eggDeckCards = cardsWithId.filter((card) => card.cardType === "Digi-Egg");

        set({ mainDeckCards, eggDeckCards });
        const timeout = setTimeout(() => set({ isLoading: false }), 700);
        return () => clearTimeout(timeout);
    },

    exportDeck: (exportFormat, deckname): string => {
        const mainDeckCards = get().mainDeckCards;
        const eggDeckCards = get().eggDeckCards;
        const allCards = [...mainDeckCards, ...eggDeckCards];

        if (exportFormat === "text") {
            const uniqueCardsMap = new Map();
            allCards.forEach((card) => uniqueCardsMap.set(card.cardNumber, card));
            const uniqueCards = Array.from(uniqueCardsMap.values());
            const decklist = uniqueCards
                .map((card) => {
                    const cardCount = allCards.filter((c) => c.cardNumber === card.cardNumber).length;
                    return `${cardCount} ${card.name} ${card.cardNumber}`;
                })
                .join("\n");
            return `// ${deckname}\n\n${decklist}`;
        }

        return JSON.stringify(
            allCards.map((card) => (exportFormat === "tts" ? card.cardNumber : card.uniqueCardNumber))
        );
    },
}));
