import { create } from "zustand";
import {CardType, CardTypeGame, CardTypeWithId, DeckType, SearchCards} from "../utils/types.ts";
import axios from "axios";
import { uid } from "uid";
import 'react-toastify/dist/ReactToastify.css';
import { notifyAlreadyExists, notifyInvalidUsername, notifyCredentials, notifyDelete, notifyError, notifyGeneralError, notifyInvalidImport,
         notifyLength, notifyName, notifyPasswordChanged, notifyQuestionChanged, notifyRegistered, notifySuccess,
         notifyUpdate, notifyWrongAnswer
} from "../utils/toasts.ts";
import { NavigateFunction } from "react-router-dom";
import {
    addStarterDecks,
    compareEffectText,
    filterDoubleCardNumbers,
    getIsDeckAllowed,
    sortCards,
} from "../utils/functions.ts";
import { avatars } from "../utils/avatars.ts";
import {DeckIdOrder} from "../pages/Profile.tsx";
import {Dispatch, SetStateAction} from "react";
import {generalToken} from "../utils/tokens.ts";

type State = {
    fetchedCards: CardTypeWithId[],
    filteredCards: CardTypeWithId[],
    isLoading: boolean,
    loadingDeck: boolean,
    selectedCard: CardTypeWithId | CardTypeGame | null,
    hoverCard: CardTypeWithId | null,
    deckCards: CardTypeWithId[],
    decks: DeckType[],
    nameOfDeckToEdit: string,
    idOfDeckToEdit: string,
    user: string,
    activeDeckId: string,
    isSaving: boolean,
    avatarName: string,
    deckIdOrder: string[],
    orderedDecks: DeckType[],
    deckIdToSetSleeveOrImage: string,
    selectedSleeveOrImage: string,

    fetchCards: () => void,
    filterCards: SearchCards,
    selectCard: (card: CardTypeWithId | CardTypeGame | null) => void,
    setHoverCard: (card: CardTypeWithId | CardTypeGame | null) => void,
    addCardToDeck: (cardnumber: string, type: string, uniqueCardNumber: string) => void,
    deleteFromDeck: (id: string) => void,
    saveDeck: (name: string, setCurrentDeckLength: Dispatch<SetStateAction<number>>) => void,
    fetchDecks: () => void,
    updateDeck: (id: string, name: string) => void,
    setDeckById: (id: string | undefined) => void,
    deleteDeck: (id: string, navigate: NavigateFunction) => void,
    clearDeck: () => void,
    login: (userName: string, password: string, navigate: NavigateFunction) => void,
    me: () => void,
    register: (userName: string, password: string, question: string, answer: string,
               setRegisterPage: (state: boolean) => void, navigate: NavigateFunction) => void,
    setActiveDeck: (deckId: string) => void,
    getActiveDeck: () => void,
    setAvatar: (avatarName: string) => void,
    getAvatar: () => string,
    importDeck: (decklist: string | string[], format: string) => void,
    exportDeck: (exportFormat: string, deckname: string) => string,

    usernameForRecovery: string,
    recoveryQuestion: string,
    getRecoveryQuestion: (userName: string) => void,
    recoverPassword: (answer: string, newPassword: string, navigate: NavigateFunction) => void,
    changeSafetyQuestion: (question: string, answer: string) => void,
    loadOrderedDecks: (setOrderedDecks: Dispatch<SetStateAction<DeckType[]>>) => void,
    setDeckIdOrder: (deckIdOrder: DeckIdOrder, setOrderedDecks: Dispatch<SetStateAction<DeckType[]>>) => void,
    setDeckIdToSetSleeveOrImage: (deckId: string) => void,
    setSleeve: (sleeveName: string) => void,
    setSelectedSleeveOrImage: (sleeveName: string) => void,
    getCardImagesInDeck: () => string[],
    setCardImage: (imgUrl: string) => void,
};

export const useStore = create<State>((set, get) => ({

    fetchedCards: [],
    filteredCards: [],
    isLoading: false,
    selectedCard: null,
    hoverCard: null,
    deckCards: JSON.parse(localStorage.getItem('deckCards') ?? '[]'),
    decks: [],
    nameOfDeckToEdit: "",
    idOfDeckToEdit: "",
    user: "",
    activeDeckId: "",
    isSaving: false,
    avatarName: "",
    gameId: "",
    loadingDeck: false,
    usernameForRecovery: "",
    recoveryQuestion: "",
    deckIdOrder: [],
    orderedDecks: [],
    deckIdToSetSleeveOrImage: "",
    selectedSleeveOrImage: "",

    fetchCards: () => {
        set({isLoading: true})
        axios
            .get("/api/profile/cards")
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => {
                const cardsWithId: CardTypeWithId[] = data.map((card: CardType) => ({...card, id: uid()}));
                set({
                    fetchedCards: cardsWithId,
                    filteredCards: cardsWithId
                });
            })
            .finally(() => set({isLoading: false}));
    },

    filterCards: (name,
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
                  level,
                  illustrator,
                  effect,
                  ace,
                  altArtsEnabled
    ) => {

        set({isLoading: true})

        let filteredData = get().fetchedCards;

        if (name) filteredData = filteredData.filter((card) => card.name.toUpperCase().includes(name.toUpperCase()));
        if (color) filteredData = filteredData.filter((card) => card.color.includes(color));
        if (color2) filteredData = filteredData.filter((card) => card.color.includes(color2));
        if (color3) filteredData = filteredData.filter((card) => card.color.includes(color3));
        if (cardType) filteredData = filteredData.filter((card) => card.cardType === cardType);
        if (stage) filteredData = filteredData.filter((card) => card.stage === stage);
        if (attribute) filteredData = filteredData.filter((card) => card.attribute === attribute);
        if (digiType) filteredData = filteredData.filter((card) => card.digiType?.join(' ').toUpperCase().includes(digiType.toUpperCase()));
        if (dp) filteredData = filteredData.filter((card) => card.dp === dp);
        if (playCost) filteredData = filteredData.filter((card) => card.playCost === playCost);
        if (level) filteredData = filteredData.filter((card) => card.level === level);
        if (cardNumber) filteredData = filteredData.filter((card) => card.cardNumber.toUpperCase().includes(cardNumber.toUpperCase()));
        if (illustrator) filteredData = filteredData.filter((card) => card.illustrator.toUpperCase().includes(illustrator.toUpperCase()));
        if (effect) filteredData = filteredData.filter((card) => compareEffectText(effect, card));
        if (ace) filteredData = filteredData.filter((card) => !!card.aceEffect);
        if (!altArtsEnabled) filteredData = filteredData.filter((card) => !card.uniqueCardNumber.includes("_P") && !card.uniqueCardNumber.includes("-E"));
        filteredData = filterDoubleCardNumbers(filteredData); //bug quickfix

        set({filteredCards: filteredData, isLoading: false});
    },

    selectCard: (card) => set({selectedCard: card}),

    setHoverCard: (card) => set({hoverCard: card}),

    addCardToDeck: (cardNumber, type, uniqueCardNumber) => {
        const digiEggsInDeck = get().deckCards.filter((card) => card.cardType === "Digi-Egg").length;
        const cardOfIdInDeck = get().deckCards.filter((card) => card.cardNumber === cardNumber).length;
        const cardToAdd = {
            ...get().fetchedCards.filter((card) => card.uniqueCardNumber === uniqueCardNumber)[0],
            id: uid()
        };

        if (type === "Digi-Egg" && digiEggsInDeck < 5 && cardOfIdInDeck < 4) {
            set({deckCards: [cardToAdd, ...get().deckCards]});
            return;
        }

        const eggCardLength = get().deckCards.filter((card) => card.cardType === "Digi-Egg").length;
        const filteredLength = get().deckCards.length - eggCardLength; // 50 deck-cards & max 5 eggs

        if (filteredLength >= 50) return;

        const cardsWithoutLimit: string[] = ["BT11-061", "EX2-046", "BT6-085"];
        if (cardsWithoutLimit.includes(cardNumber)) {     // unique effect
            set({deckCards: [cardToAdd, ...get().deckCards]});
            return;
        }

        if ((type === "Digi-Egg" && digiEggsInDeck >= 5) || cardOfIdInDeck >= 4) return;

        set({deckCards: [cardToAdd, ...get().deckCards]});
        localStorage.setItem('deckCards', JSON.stringify(get().deckCards));
    },

    deleteFromDeck: (id) => {
        set({deckCards: get().deckCards.filter((card) => card.id !== id)});
    },

    saveDeck: (name, setCurrentDeckLength) => {
        const eggCardLength = get().deckCards.filter((card) => card.cardType === "Digi-Egg").length;
        const filteredLength = get().deckCards.length - eggCardLength;

        if (filteredLength !== 50) {
            notifyLength();
            return;
        }

        if (name === "") {
            notifyName();
            return;
        }

        set({isSaving: true});

        const sortedDeck = sortCards(get().deckCards);

        const deckToSave = {
            name: name,
            decklist: sortedDeck.map((card) => card.uniqueCardNumber),
            deckImageCardUrl: sortedDeck.at(-1)?.imgUrl,
            sleeveName: "Default",
            isAllowed_en: getIsDeckAllowed(sortedDeck, "en"),
            isAllowed_jp: getIsDeckAllowed(sortedDeck, "jp")
        }

        axios
            .post("/api/profile/decks", deckToSave)
            .then((res) => res.data)
            .catch((error) => {
                console.error(error.message);
                notifyGeneralError();
                throw error;
            })
            .then((data) => {
                if (data === "There was an error while saving the deck.") notifyGeneralError();
                else {
                    notifySuccess();
                    setCurrentDeckLength((p) => p + 1);
                    get().fetchDecks();
                }
                setTimeout(function () {
                    set({isSaving: false});
                }, 2900)
            })
            .finally(() => get().clearDeck());
    },

    fetchDecks: () => {
        set({isLoading: true})
        axios
            .get("/api/profile/decks")
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => {
                set({decks: data});
            }).finally(() => set({isLoading: false}));
    },

    updateDeck: (id, name) => {

        const eggCardLength = get().deckCards.filter((card) => card.cardType === "Digi-Egg").length;
        const filteredLength = get().deckCards.length - eggCardLength;

        if (filteredLength !== 50) {
            notifyLength();
            return;
        }

        if (name === "") {
            notifyName();
            return;
        }

        const sortedDeck = sortCards(get().deckCards);
        const deckWithoutId = {
            name: name,
            decklist: sortedDeck.map((card) => card.uniqueCardNumber),
            isAllowed_en: getIsDeckAllowed(sortedDeck, "en"),
            isAllowed_jp: getIsDeckAllowed(sortedDeck, "jp")
        }

        axios
            .put(`/api/profile/decks/${id}`, deckWithoutId)
            .then((res) => res.data)
            .catch((error) => {
                console.error(error);
                notifyError();
                throw error;
            })
            .then(() => {
                notifyUpdate();
            });
    },

    setDeckById: (id) => {

        if (id === undefined) return;
        set({loadingDeck: true, filteredCards: []});
        axios
            .get(`/api/profile/decks/${id}`)
            .then((res) => res.data)
            .catch(console.error)
            .then((data: DeckType) => {

                const cards = get().fetchedCards;
                const cardsWithId: CardTypeWithId[] = data.decklist.map((uniqueCardNumber) => {
                        const card = cards.filter((card) => card.uniqueCardNumber === uniqueCardNumber)[0]
                            ?? cards.filter((card) => card.cardNumber === uniqueCardNumber.split("_")[0])[0]
                            ?? {...generalToken, cardNumber: "1110101", uniqueCardNumber: "1110101", name: "Fallback Card",
                                mainEffect: "If you see this card, the actual card was not found."}
                        return { ...card, id: uid()}
                    }
                );
                localStorage.setItem('deckCards', JSON.stringify(cardsWithId));
                set({
                    deckCards: cardsWithId,
                    nameOfDeckToEdit: data.name,
                    idOfDeckToEdit: id
                });
            })
            .finally(() => {
                const timeout = setTimeout(() => {
                    set({loadingDeck: false});
                }, 1200);
                return () => clearTimeout(timeout);
            });

    },

    deleteDeck: (id, navigate) => {

        axios
            .delete(`/api/profile/decks/${id}`)
            .then((res) => res.data)
            .catch((error) => {
                console.error(error);
                notifyError();
                throw error;
            })
            .then(() => {
                navigate("/profile");
                set({deckCards: []});
                notifyDelete();
            });
    },

    clearDeck: () => {
        set({deckCards: []});
        localStorage.removeItem('deckCards');
    },

    login: (userName: string, password: string, navigate: NavigateFunction) => {
        axios.post("/api/user/login", null, {
            auth: {
                username: userName,
                password: password
            }
        })
            .then(response => {
                set({user: response.data})
                navigate("/");
            })
            .catch((error) => {
                console.error(error);
                notifyCredentials();
                throw error;
            })
    },

    me: () => {
        axios.get("/api/user/me")
            .then(response => set({user: response.data}))
    },

    register: (userName, password, question, answer, setRegisterPage, navigate) => {
        const newUserData = {
            "username": `${userName}`,
            "password": `${password}`,
            "question": `${question}`,
            "answer": `${answer}`
        }

        axios.post("/api/user/register", newUserData)
            .then(response => {
                setRegisterPage(false);
                if (response.data === "Username already exists!") {
                    notifyAlreadyExists();
                }
                if (response.data === "Invalid username!") {
                    notifyInvalidUsername();
                }
                if (response.data === "Successfully registered!") {
                    notifyRegistered();
                    get().login(userName, password, navigate);
                    setTimeout(function () {
                        addStarterDecks();
                    }, 3000);
                }
            });
    },

    setActiveDeck: (deckId) => {
        axios.put(`/api/user/active-deck/${deckId}`, null)
            .catch(console.error)
            .finally(() => {
                set({activeDeckId: deckId});
            });
    },

    getActiveDeck: () => {
        axios.get("/api/user/active-deck")
            .then(response => set({activeDeckId: response.data}))
            .catch(console.error);
    },

    setAvatar: (avatarName) => {
        axios.put(`/api/user/avatar/${avatarName}`, null)
            .catch(console.error)
            .finally(() => {
                set({avatarName: avatarName});
            });
    },

    getAvatar: () => {
        axios.get("/api/user/avatar")
            .then(response => set({avatarName: avatars.some((avatar) => avatar.name.includes(response.data)) ? response.data : "AncientIrismon"}))
            .catch(console.error);
        return get().avatarName;
    },

    importDeck: (decklist, format) => {
        set({loadingDeck: true});

        const constructedDecklist: string[] = [];
        if (format === "text") {
            (decklist as string).split("\n").forEach((line) => {
                const linesSplits = line.split(" ");
                if (linesSplits.length < 2 || !Number(linesSplits[0])) return;
                const amount = Number(linesSplits[0]);
                const cardnumber = linesSplits[linesSplits.length - 1];
                for (let i = 0; i < amount; i++) {
                    constructedDecklist.push(cardnumber);
                }
            });
        }

        const cardsWithId: CardTypeWithId[] = (format === "text" ? constructedDecklist : decklist as string[])
            .map((cardnumber: string) => ({
                ...get().fetchedCards.filter((card) => card.uniqueCardNumber === cardnumber)[0],
                id: uid()
            }))
            .filter((card) => card.name !== undefined);
        // --- check if deck is valid ---
        const eggCardLength = cardsWithId.filter((card) => card.cardType === "Digi-Egg").length;
        const filteredLength = cardsWithId.length - eggCardLength;
        if (eggCardLength > 5 || filteredLength > 50) {
            notifyInvalidImport();
            set({loadingDeck: false});
            return;
        }
        const cardsWithoutLimit: string[] = ["BT11-061", "EX2-046", "BT6-085"];
        for (const card of cardsWithId) {
            const cardOfIdInDeck = cardsWithId.filter((c) => c.cardNumber === card.cardNumber).length;
            if (cardOfIdInDeck > 4 && !cardsWithoutLimit.includes(card.cardNumber)) {
                notifyInvalidImport();
                set({loadingDeck: false});
                return;
            }
        }
        // ---
        set({deckCards: cardsWithId});
        const timeout = setTimeout(() => {
            set({loadingDeck: false});
        }, 700);
        return () => clearTimeout(timeout);
    },

    exportDeck: (exportFormat, deckname): string => {

        if (exportFormat === "text") {
            const deckCards = get().deckCards;
            const uniqueCardsMap = new Map();
            deckCards.forEach((card) => uniqueCardsMap.set(card.cardNumber, card));
            const uniqueCards = Array.from(uniqueCardsMap.values());
            const decklist = uniqueCards.map((card) => {
                const cardCount = deckCards.filter((c) => c.cardNumber === card.cardNumber).length
                return `${cardCount} ${card.name} ${card.cardNumber}`;
            }).join("\n");
            return `// ${deckname}\n\n${decklist}`;
        }

        if (exportFormat === "tts") {
            const decklist = get().deckCards.map((card) => card.cardNumber);
            return JSON.stringify(decklist);
        } else {
            const decklist = get().deckCards.map((card) => card.uniqueCardNumber);
            return JSON.stringify(decklist);
        }
    },

    getRecoveryQuestion: (username) => {
        axios.get(`/api/user/recovery/${username}`)
            .then(response => response?.data)
            .catch(console.error)
            .then(data => {
                set({recoveryQuestion: data, usernameForRecovery: username});
            });
    },

    recoverPassword: (answer, password, navigate) => {
        const passwordRecovery = {
            "username": `${get().usernameForRecovery}`,
            "answer": `${answer}`,
            "newPassword": `${password}`
        }

        axios.put("/api/user/recovery", passwordRecovery)
            .then(response => {
                if (response.data === "Answer didn't match!") {
                    notifyWrongAnswer();
                }
                if (response.data === "Password changed!") {
                    notifyPasswordChanged();
                    navigate("/login");
                }
            });
    },

    changeSafetyQuestion: (question, answer) => {
        const safetyQuestionChange = {
            "question": `${question}`,
            "answer": `${answer}`
        }

        axios.put("/api/user/change-question", safetyQuestionChange)
            .then(response => {
                if (response.data === "Safety question changed!") {
                    notifyQuestionChanged();
                } else {
                    notifyGeneralError();
                }
            });
    },

    loadOrderedDecks: (setOrderedDecks) => {
        set ({isLoading: true});
        axios
            .get("/api/profile/cards")
            .then((res) => res.data)
            .catch(console.error)
            .then((data) => set({ fetchedCards: data.map((card: CardType) => ({...card, id: uid()})) }))
            .then(() => axios
                .get("/api/profile/decks")
                .then((res) => res.data)
                .catch(console.error)
                .then((data) => set({decks: data}))
            )
            .then(() => {
                const savedDeckIdOrder : DeckIdOrder | null = JSON.parse(localStorage.getItem('deckIdOrder') ?? 'null');
                set({deckIdOrder: savedDeckIdOrder ?? get().decks.map((deck) => deck.id)});
            })
            .then(() => {
                const { decks, deckIdOrder } = get();

                const orderedDecks = deckIdOrder.flatMap(orderedId => {
                    const foundDeck = decks.find(deck => deck.id === orderedId);
                    return foundDeck ? [foundDeck] : [];
                });

                const newDecks = decks.filter(deck => !deckIdOrder.includes(deck.id)); // look for new decks
                set({deckIdOrder: [...deckIdOrder, ...newDecks.map(deck => deck.id)]}); // add them to the order

                setOrderedDecks([...orderedDecks, ...newDecks]);
            })
            .finally(() => set({isLoading: false}));
    },

    setDeckIdOrder: (deckIdOrder, setOrderedDecks ) => {
        set({deckIdOrder});
        localStorage.setItem('deckIdOrder', JSON.stringify(deckIdOrder));
        setOrderedDecks(deckIdOrder.flatMap((orderedId) => {
            const foundDeck = get().decks.find((deck) => deck.id === orderedId);
            return foundDeck ? [foundDeck] : [];
        }));
    },

    setDeckIdToSetSleeveOrImage: (deckId) => set({deckIdToSetSleeveOrImage: deckId}),

    setSleeve: (sleeveName) => {
        axios.put(`/api/profile/decks/${get().deckIdToSetSleeveOrImage}/sleeve/${sleeveName}`)
            .catch((e) => console.error(e))
            .finally(() => set({selectedSleeveOrImage: sleeveName}));
    },

    setSelectedSleeveOrImage: (sleeveName) => set({selectedSleeveOrImage: sleeveName}),

    getCardImagesInDeck: () =>  Array.from(new Set(get().deckCards.map(card => card.imgUrl))),

    setCardImage: (imgUrl) => {
        axios.put(`/api/profile/decks/${get().deckIdToSetSleeveOrImage}/image`, {imgUrl})
            .catch((e) => console.error(e))
            .finally(() => set({selectedSleeveOrImage: imgUrl}));
    }

}));
