import { create } from "zustand";
import { CardTypeGame, CardTypeWithId } from "../utils/types.ts";
import axios from "axios";
import "react-toastify/dist/ReactToastify.css";
import { notifySuccess, notifyError } from "../utils/toasts.ts";
import { NavigateFunction } from "react-router-dom";
import { avatars } from "../utils/avatars.ts";

export const fallbackCardNumber = "1110101";

type State = {
    particlesInitialized: boolean;
    setParticlesInitialized: (state: boolean) => void;

    cardWidth: number;
    setCardWidth: (width: number) => void;

    isLoading: boolean;

    selectedCard: CardTypeWithId | CardTypeGame | null;
    selectCard: (card: CardTypeWithId | CardTypeGame | null) => void;
    hoverCard: CardTypeWithId | null;
    setHoverCard: (card: CardTypeWithId | CardTypeGame | null) => void;

    user: string;
    activeDeckId: string;
    avatarName: string;
    deckIdToSetSleeveOrImage: string;
    selectedSleeveOrImage: string;

    login: (userName: string, password: string, navigate: NavigateFunction) => void;
    me: () => void;
    register: (
        userName: string,
        password: string,
        question: string,
        answer: string,
        setRegisterPage: (state: boolean) => void,
        navigate: NavigateFunction
    ) => void;
    setActiveDeck: (deckId: string) => void;
    getActiveDeck: () => string;
    setAvatar: (avatarName: string) => void;
    getAvatar: () => string;

    usernameForRecovery: string;
    recoveryQuestion: string;
    getRecoveryQuestion: (userName: string) => void;
    recoverPassword: (answer: string, newPassword: string, navigate: NavigateFunction) => void;
    changeSafetyQuestion: (question: string, answer: string) => void;

    setDeckIdToSetSleeveOrImage: (deckId: string) => void;
    setSleeve: (sleeveName: string) => void;
    setSelectedSleeveOrImage: (sleeveName: string) => void;
    setCardImage: (imgUrl: string) => void;
};

export const useGeneralStates = create<State>((set, get) => ({
    isLoading: false,
    selectedCard: null,
    hoverCard: null,

    user: "",
    activeDeckId: "",
    avatarName: "",
    gameId: "",
    usernameForRecovery: "",
    recoveryQuestion: "",

    deckIdToSetSleeveOrImage: "",
    selectedSleeveOrImage: "",

    particlesInitialized: false,
    setParticlesInitialized: (particlesInitialized: boolean) => set({ particlesInitialized }),

    cardWidth: 70,
    setCardWidth: (number) => set({ cardWidth: number }),

    selectCard: (card) => set({ selectedCard: card }),

    setHoverCard: (card) => set({ hoverCard: card }),

    login: (userName: string, password: string, navigate: NavigateFunction) => {
        axios
            .post("/api/user/login", null, {
                auth: {
                    username: userName,
                    password: password,
                },
            })
            .then((response) => {
                set({ user: response.data });
                navigate("/");
            })
            .catch((error) => {
                notifyError(error?.request?.response ?? "Authentication failed");
                throw error;
            });
    },

    me: () => {
        axios.get("/api/user/me").then((response) => set({ user: response.data }));
    },

    register: (userName, password, question, answer, setRegisterPage, navigate) => {
        const newUserData = {
            username: `${userName}`,
            password: `${password}`,
            question: `${question}`,
            answer: `${answer}`,
        };

        axios.post("/api/user/register", newUserData).then((response) => {
            setRegisterPage(false);
            if (response.data === "Username already exists!") {
                notifyError("Username already exists!");
            }
            if (response.data === "Invalid username!") {
                notifyError("Invalid username!");
            }
            if (response.data === "Successfully registered!") {
                notifySuccess("Registered successfully!");
                get().login(userName, password, navigate);
            }
        });
    },

    setActiveDeck: (deckId) => {
        axios
            .put(`/api/user/active-deck/${deckId}`, null)
            .catch(console.error)
            .finally(() => set({ activeDeckId: deckId }));
    },

    getActiveDeck: () => {
        let activeDeck = "";
        axios
            .get("/api/user/active-deck")
            .then((response) => {
                set({ activeDeckId: response.data });
                activeDeck = response.data;
            })
            .catch(console.error);
        return activeDeck;
    },

    setAvatar: (avatarName) => {
        axios
            .put(`/api/user/avatar/${avatarName}`, null)
            .catch(console.error)
            .finally(() => set({ avatarName: avatarName }));
    },

    getAvatar: () => {
        axios
            .get("/api/user/avatar")
            .then((response) =>
                set({
                    avatarName: avatars.some((avatar) => avatar.name.includes(response.data))
                        ? response.data
                        : "AncientIrismon",
                })
            )
            .catch(console.error);
        return get().avatarName;
    },

    getRecoveryQuestion: (username) => {
        axios
            .get(`/api/user/recovery/${username}`)
            .then((response) => response?.data)
            .catch(console.error)
            .then((data) => {
                set({ recoveryQuestion: data, usernameForRecovery: username });
            });
    },

    recoverPassword: (answer, password, navigate) => {
        const passwordRecovery = {
            username: `${get().usernameForRecovery}`,
            answer: `${answer}`,
            newPassword: `${password}`,
        };

        axios.put("/api/user/recovery", passwordRecovery).then((response) => {
            if (response.data === "Answer didn't match!") {
                notifyError("Answer didn't match!");
            }
            if (response.data === "Password changed!") {
                notifySuccess("Password changed!");
                navigate("/login");
            }
        });
    },

    changeSafetyQuestion: (question, answer) => {
        const safetyQuestionChange = {
            question: `${question}`,
            answer: `${answer}`,
        };

        axios.put("/api/user/change-question", safetyQuestionChange).then((response) => {
            if (response.data === "Safety question changed!") notifySuccess("Safety question updated!");
            else notifyError("Something went wrong!");
        });
    },

    setDeckIdToSetSleeveOrImage: (deckId) => set({ deckIdToSetSleeveOrImage: deckId }),

    setSleeve: (sleeveName) => {
        axios
            .put(`/api/profile/decks/${get().deckIdToSetSleeveOrImage}/sleeve/${sleeveName}`)
            .catch((e) => console.error(e))
            .finally(() => set({ selectedSleeveOrImage: sleeveName }));
    },

    setSelectedSleeveOrImage: (sleeveName) => set({ selectedSleeveOrImage: sleeveName }),

    setCardImage: (imgUrl) => {
        axios
            .put(`/api/profile/decks/${get().deckIdToSetSleeveOrImage}/image`, { imgUrl })
            .catch((e) => console.error(e))
            .finally(() => set({ selectedSleeveOrImage: imgUrl }));
    },
}));
