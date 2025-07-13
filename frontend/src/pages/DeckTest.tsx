import GameBackground from "../components/game/GameBackground.tsx";
import styled from "@emotion/styled";
import { IconButton } from "@mui/material";
import carbackSrc from "../assets/cardBack.jpg";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import PlayerBoardSide from "../components/game/PlayerBoardSide/PlayerBoardSide.tsx";
import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import { useContextMenu } from "react-contexify";
import SoundBar from "../components/SoundBar.tsx";
import MemoryBar from "../components/game/MemoryBar.tsx";
import { useSound } from "../hooks/useSound.ts";
import ContextMenus from "../components/game/ContextMenus/ContextMenus.tsx";
import { DndContext, MouseSensor, pointerWithin, TouchSensor, useSensor } from "@dnd-kit/core";
import useDropZone from "../hooks/useDropZone.ts";
import { useGameBoardStates } from "../hooks/useGameBoardStates.ts";
import { BootStage, CardTypeGame, CardTypeWithId, Phase, DeckType } from "../utils/types.ts";
import { SendMessage } from "react-use-websocket";
import EndModal from "../components/game/ModalDialog/EndModal.tsx";
import TokenModal from "../components/game/ModalDialog/TokenModal.tsx";
import GameChatLog from "../components/game/GameChatLog.tsx";
import { Gavel as RulingsIcon, OpenInNew as LinkIcon } from "@mui/icons-material";
import { useGameUIStates } from "../hooks/useGameUIStates.ts";
import RevealArea from "../components/game/RevealArea.tsx";
import StackModal from "../components/game/StackModal.tsx";
import DragOverlayCards from "../components/game/DragOverlayCards.tsx";
import CardModal from "../components/game/CardModal.tsx";
import CardDetails from "../components/cardDetails/CardDetails.tsx";
import SettingsMenuButton from "../components/game/SettingsMenuButton.tsx";
import { DetailsView, useSettingStates } from "../hooks/useSettingStates.ts";
import { useDeckStates } from "../hooks/useDeckStates.ts";
import { useNavigate } from "react-router-dom";
import ProfileDeck from "../components/profile/ProfileDeck.tsx";
import MenuDialog from "../components/MenuDialog.tsx";
import CustomDialogTitle from "../components/profile/CustomDialogTitle.tsx";
import ChooseCardSleeve from "../components/profile/ChooseCardSleeve.tsx";
import ChooseDeckImage from "../components/profile/ChooseDeckImage.tsx";
import axios from "axios";

export default function DeckTest() {
    const selectCard = useGeneralStates((state) => state.selectCard);
    const selectedCard = useGeneralStates((state) => state.selectedCard);
    const hoverCard = useGeneralStates((state) => state.hoverCard);
    const user = useGeneralStates((state) => state.user);
    const activeDeckId = useGeneralStates((state) => state.activeDeckId);
    const avatarName = useGeneralStates((state) => state.avatarName);
    const getAvatar = useGeneralStates((state) => state.getAvatar);
    const setActiveDeck = useGeneralStates((state) => state.setActiveDeck);
    const getActiveDeck = useGeneralStates((state) => state.getActiveDeck);

    const navigate = useNavigate();

    const decks = useDeckStates((state) => state.decks);
    const fetchedCards = useDeckStates((state) => state.fetchedCards);

    const clearBoard = useGameBoardStates((state) => state.clearBoard);
    const setUpGame = useGameBoardStates((state) => state.setUpGame);
    const setPhase = useGameBoardStates((state) => state.setPhase);
    const setMessages = useGameBoardStates((state) => state.setMessages);

    const playAttackSfx = useSound((state) => state.playAttackSfx);
    const playEffectAttackSfx = useSound((state) => state.playEffectAttackSfx);
    const playNextPhaseSfx = useSound((state) => state.playNextPhaseSfx);
    const playShuffleDeckSfx = useSound((state) => state.playShuffleDeckSfx);

    const setArrowFrom = useGameBoardStates((state) => state.setArrowFrom);
    const setArrowTo = useGameBoardStates((state) => state.setArrowTo);
    const setIsEffectArrow = useGameBoardStates((state) => state.setIsEffectArrow);

    const stackModal = useGameUIStates((state) => state.stackModal);
    const openedCardModal = useGameUIStates((state) => state.openedCardModal);

    const details = useSettingStates((state) => state.details);

    const { show: showDetailsImageMenu } = useContextMenu({ id: "detailsImageMenu" });

    const [clearAttackAnimation, setClearAttackAnimation] = useState<(() => void) | null>(null);
    const [phaseLoading, setPhaseLoading] = useState(false);
    const [sleeveSelectionOpen, setSleeveSelectionOpen] = useState(false);
    const [imageSelectionOpen, setImageSelectionOpen] = useState(false);
    const [deckObject, setDeckObject] = useState<DeckType | null>(null);

    const timeoutRef = useRef<number | null>(null);

    // Convert CardTypeWithId to CardTypeGame
    const convertToGameCard = useCallback(
        (card: CardTypeWithId): CardTypeGame => ({
            ...card,
            modifiers: {
                plusDp: 0,
                plusSecurityAttacks: 0,
                keywords: [],
                colors: card.color,
            },
            isTilted: false,
            isFaceUp: false,
        }),
        []
    );

    // Multi-algorithm shuffle function for maximum randomness and cluster breaking
    const shuffleCards = useCallback((cards: CardTypeGame[]): CardTypeGame[] => {
        let shuffledCards = [...cards];

        // Phase 1: Initial Fisher-Yates shuffles
        for (let round = 0; round < 3; round++) {
            shuffledCards = fisherYatesShuffle(shuffledCards);
        }

        // Phase 2: Riffle shuffle (mimics physical card shuffling)
        shuffledCards = riffleShuffle(shuffledCards);
        shuffledCards = riffleShuffle(shuffledCards);

        // Phase 3: Inside-out shuffle (different distribution pattern)
        shuffledCards = insideOutShuffle(shuffledCards);

        // Phase 4: Block shuffle (breaks up large clusters)
        shuffledCards = blockShuffle(shuffledCards);

        // Phase 5: Bias correction to eliminate remaining clusters
        shuffledCards = correctCardClustering(shuffledCards);

        // Phase 6: Sattolo's algorithm (creates single cycle)
        shuffledCards = sattoloShuffle(shuffledCards);

        // Phase 7: Final Fisher-Yates shuffles
        for (let round = 0; round < 3; round++) {
            shuffledCards = fisherYatesShuffle(shuffledCards);
        }

        // Phase 8: Reverse-order shuffle for final cluster breaking
        shuffledCards = reverseBlockShuffle(shuffledCards);

        return shuffledCards;
    }, []);

    // Bias correction to actively break up card clusters
    const correctCardClustering = useCallback((cards: CardTypeGame[]): CardTypeGame[] => {
        const result = [...cards];
        const maxAttempts = 1000;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            let clustersFound = false;

            // Look for adjacent identical cards
            for (let i = 0; i < result.length - 1; i++) {
                if (result[i].uniqueCardNumber === result[i + 1].uniqueCardNumber) {
                    clustersFound = true;

                    // Find a non-adjacent position for the second card
                    let newPos = -1;
                    const attempts = 50;

                    for (let j = 0; j < attempts; j++) {
                        const randomArray = new Uint32Array(1);
                        crypto.getRandomValues(randomArray);
                        const candidate = randomArray[0] % result.length;

                        // Ensure the new position doesn't create new clusters
                        const wouldCreateCluster =
                            (candidate > 0 &&
                                result[candidate - 1].uniqueCardNumber === result[i + 1].uniqueCardNumber) ||
                            (candidate < result.length - 1 &&
                                result[candidate + 1].uniqueCardNumber === result[i + 1].uniqueCardNumber) ||
                            Math.abs(candidate - i) <= 1; // Don't place too close to original position

                        if (!wouldCreateCluster) {
                            newPos = candidate;
                            break;
                        }
                    }

                    // If we found a good position, swap the cards
                    if (newPos !== -1) {
                        [result[i + 1], result[newPos]] = [result[newPos], result[i + 1]];
                    }
                }
            }

            // If no clusters found, we're done
            if (!clustersFound) break;
        }

        return result;
    }, []);

    // Fisher-Yates shuffle implementation
    const fisherYatesShuffle = useCallback((array: CardTypeGame[]): CardTypeGame[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const randomArray = new Uint32Array(1);
            crypto.getRandomValues(randomArray);
            const j = randomArray[0] % (i + 1);
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

    // Riffle shuffle (mimics physical card shuffling)
    const riffleShuffle = useCallback((array: CardTypeGame[]): CardTypeGame[] => {
        const shuffled = [...array];
        const mid = Math.floor(shuffled.length / 2);
        const left = shuffled.slice(0, mid);
        const right = shuffled.slice(mid);
        const result: CardTypeGame[] = [];

        let leftIndex = 0,
            rightIndex = 0;

        while (leftIndex < left.length && rightIndex < right.length) {
            // Random choice between left and right pile
            const randomArray = new Uint32Array(1);
            crypto.getRandomValues(randomArray);

            if (randomArray[0] % 2 === 0) {
                result.push(left[leftIndex++]);
            } else {
                result.push(right[rightIndex++]);
            }
        }

        // Add remaining cards
        result.push(...left.slice(leftIndex));
        result.push(...right.slice(rightIndex));

        return result;
    }, []);

    // Inside-out shuffle (builds shuffled array from scratch)
    const insideOutShuffle = useCallback((array: CardTypeGame[]): CardTypeGame[] => {
        const result: CardTypeGame[] = [];

        for (let i = 0; i < array.length; i++) {
            const randomArray = new Uint32Array(1);
            crypto.getRandomValues(randomArray);
            const j = randomArray[0] % (i + 1);

            if (j === i) {
                result.push(array[i]);
            } else {
                result.push(result[j]);
                result[j] = array[i];
            }
        }

        return result;
    }, []);

    // Block shuffle (divides into blocks and shuffles them)
    const blockShuffle = useCallback((array: CardTypeGame[]): CardTypeGame[] => {
        const shuffled = [...array];
        const blockSize = Math.max(3, Math.floor(Math.sqrt(array.length)));
        const blocks: CardTypeGame[][] = [];

        // Divide into blocks
        for (let i = 0; i < shuffled.length; i += blockSize) {
            blocks.push(shuffled.slice(i, i + blockSize));
        }

        // Shuffle the blocks
        for (let i = blocks.length - 1; i > 0; i--) {
            const randomArray = new Uint32Array(1);
            crypto.getRandomValues(randomArray);
            const j = randomArray[0] % (i + 1);
            [blocks[i], blocks[j]] = [blocks[j], blocks[i]];
        }

        // Shuffle within each block
        for (let block of blocks) {
            for (let i = block.length - 1; i > 0; i--) {
                const randomArray = new Uint32Array(1);
                crypto.getRandomValues(randomArray);
                const j = randomArray[0] % (i + 1);
                [block[i], block[j]] = [block[j], block[i]];
            }
        }

        // Flatten back
        return blocks.flat();
    }, []);

    // Sattolo's algorithm (creates a single cycle through all elements)
    const sattoloShuffle = useCallback((array: CardTypeGame[]): CardTypeGame[] => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const randomArray = new Uint32Array(1);
            crypto.getRandomValues(randomArray);
            const j = randomArray[0] % i; // Note: % i, not % (i + 1)
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);

    // Reverse block shuffle (works backwards through blocks)
    const reverseBlockShuffle = useCallback((array: CardTypeGame[]): CardTypeGame[] => {
        const shuffled = [...array];
        const blockSize = 4;

        // Process in reverse order blocks
        for (let start = shuffled.length - blockSize; start >= 0; start -= blockSize) {
            const end = Math.min(start + blockSize, shuffled.length);
            const block = shuffled.slice(start, end);

            // Shuffle this block
            for (let i = block.length - 1; i > 0; i--) {
                const randomArray = new Uint32Array(1);
                crypto.getRandomValues(randomArray);
                const j = randomArray[0] % (i + 1);
                [block[i], block[j]] = [block[j], block[i]];
            }

            // Put block back
            shuffled.splice(start, block.length, ...block);
        }

        return shuffled;
    }, []);

    // Initialize test game with specific deck ID (used for deck switching)
    const initializeTestGameWithDeck = useCallback(
        (deckId: string) => {
            const deckData = decks.find((deck) => deck.id === deckId);

            if (!deckData || !deckData.decklist.length) {
                setMessages("No deck found or deck is empty. Please select a different deck.");
                return;
            }

            // Get user's actual avatar and deck sleeve
            const userAvatar = avatarName || "AncientIrismon"; // fallback to default
            const userSleeve = deckData.sleeveName || "Default"; // fallback to default

            // Clear any existing board state and chat messages
            clearBoard();

            // Clear chat messages for clean test mode experience
            useGameBoardStates.setState({ messages: [] });

            // Convert deck card IDs to actual cards, preserving duplicates
            const deckCards: CardTypeWithId[] = [];
            let missingCards = 0;

            for (const cardId of deckData.decklist) {
                const foundCard = fetchedCards.find((card) => card.uniqueCardNumber === cardId);
                if (foundCard) {
                    // Create a new instance for each card to ensure unique IDs
                    deckCards.push({
                        ...foundCard,
                        id: foundCard.id + "_" + deckCards.length, // Ensure unique ID for each copy
                    });
                } else {
                    missingCards++;
                    console.warn(`Card not found in fetchedCards: ${cardId}`);
                }
            }

            // Log warnings to console instead of chat
            if (missingCards > 0) {
                console.warn(`${missingCards} cards from deck not found in card database`);
            }

            let gameCards = deckCards.map((card) => convertToGameCard(card));

            // Multi-stage shuffle the full deck (mirrors backend GameService.createGameDeck)
            gameCards = shuffleCards(gameCards);

            // Additional shuffle immediately before distribution to further break up any patterns
            gameCards = fisherYatesShuffle(gameCards);

            // Separate egg cards by cardType "Digi-Egg" (mirrors backend getEggDeck)
            const eggCards = gameCards.filter((card) => card.cardType === "Digi-Egg");
            const mainDeckCards = gameCards.filter((card) => card.cardType !== "Digi-Egg");

            // Sequential drawing from top of shuffled deck (mirrors backend drawCards)
            // 1. Draw 5 cards for security from top of main deck
            const security = mainDeckCards.splice(0, 5).map((card) => ({ ...card, isFaceUp: false }));

            // 2. Draw 5 cards for hand from top of remaining main deck
            const hand = mainDeckCards.splice(0, 5).map((card) => ({ ...card, isFaceUp: false }));

            // 3. Remaining cards stay as deck field
            const deckField = mainDeckCards.map((card) => ({ ...card, isFaceUp: false }));

            // 4. Egg deck (no additional shuffling needed - already part of main shuffle)
            const eggDeck = eggCards.map((card) => ({ ...card, isFaceUp: false }));

            // Set up game state using the store's setState pattern
            useGameBoardStates.setState({
                myHand: hand,
                mySecurity: security,
                myDeckField: deckField,
                myEggDeck: eggDeck,
                myMemory: 0,
                opponentMemory: 0,
                phase: Phase.BREEDING,
                isMyTurn: true,
                bootStage: BootStage.GAME_IN_PROGRESS, // Start directly in game
                myAvatar: userAvatar,
                mySleeve: userSleeve,
                // Simulate opponent being ready for test mode
                opponentReady: true,
            });

            // Set up game info
            setUpGame(
                { username: user, avatarName: userAvatar, sleeveName: userSleeve },
                { username: "Test Dummy", avatarName: "AncientIrismon", sleeveName: "Default" }
            );

            // Log initialization to console instead of chat for cleaner experience
            console.log(`Test Mode: Initialized deck "${deckData.name}"`);
            console.log(
                `Decklist entries: ${deckData.decklist.length}, Found cards: ${deckCards.length}, Game cards: ${gameCards.length}`
            );
            console.log(
                `Hand: ${hand.length}, Security: ${security.length}, Deck: ${deckField.length}, Eggs: ${eggDeck.length}`
            );
        },
        [
            decks,
            fetchedCards,
            convertToGameCard,
            shuffleCards,
            clearBoard,
            setUpGame,
            setMessages,
            user,
            avatarName,
            fisherYatesShuffle,
        ]
    );

    // Initialize test game
    const initializeTestGame = useCallback(() => {
        initializeTestGameWithDeck(activeDeckId);
    }, [activeDeckId, initializeTestGameWithDeck]);

    // Fetch user's avatar and active deck on component mount
    useEffect(() => {
        getAvatar();
        getActiveDeck();
    }, [getAvatar, getActiveDeck]);

    // Load active deck initially and when activeDeckId changes
    useEffect(() => {
        if (activeDeckId) {
            axios.get(`/api/profile/decks/${activeDeckId}`).then((res) => setDeckObject(res.data as DeckType));
        }
    }, [activeDeckId]);

    // Update deckObject when decks change (e.g., sleeve updated)
    useEffect(() => {
        const currentDeck = decks.find((deck) => deck.id === activeDeckId);
        if (currentDeck) {
            setDeckObject(currentDeck);
        }
    }, [decks, activeDeckId]);

    // Initialize game on component mount
    useEffect(() => {
        if (decks.length > 0 && fetchedCards.length > 0) {
            initializeTestGame();
        }
    }, [decks.length, fetchedCards.length, initializeTestGame]);

    // Mock sendMessage function for local testing
    const mockSendMessage: SendMessage = useCallback((message) => {
        const msgString = typeof message === "string" ? message : String(message);
        console.log("Test mode - would send:", msgString);
        // Log move actions to console instead of chat
        if (msgString.includes("/moveCard:")) {
            const parts = msgString.split(":");
            if (parts.length >= 5) {
                const from = parts[3];
                const to = parts[4];
                console.log(`Card moved: ${from} → ${to}`);
            }
        }
    }, []);

    // Attack animation handler
    const restartAttackAnimation = useCallback(
        (effect?: boolean) => {
            if (effect) playEffectAttackSfx();
            else playAttackSfx();

            const cancelAttackAnimation = () => {
                if (timeoutRef.current !== null) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }

                setArrowFrom("");
                setArrowTo("");
                setIsEffectArrow(false);
            };

            timeoutRef.current = setTimeout(() => {
                setArrowFrom("");
                setArrowTo("");
                setIsEffectArrow(false);
            }, 3500);

            setClearAttackAnimation(() => cancelAttackAnimation);
        },
        [playAttackSfx, playEffectAttackSfx, setArrowFrom, setArrowTo, setIsEffectArrow]
    );

    // Local drop zone handler (no WebSocket)
    const handleDragEnd = useDropZone({
        sendMessage: mockSendMessage,
        restartAttackAnimation,
        clearAttackAnimation,
    });

    // Local phase change
    function nextPhase() {
        if (phaseLoading) return;
        setPhaseLoading(true);
        const timer = setTimeout(() => {
            setPhase();
            playNextPhaseSfx();
            setPhaseLoading(false);
            console.log("Phase changed locally");
        }, 920);
        return () => clearTimeout(timer);
    }

    // Local move card tracking
    function sendMoveCard(cardId: string, from: string, to: string) {
        mockSendMessage(`test:/moveCard:${cardId}:${from}:${to}`);
    }

    // Local chat message
    function sendChatMessage(message: string) {
        if (!message.length) return;
        setMessages(user + "﹕" + message);
    }

    // Exit test mode and return to lobby
    function handleExit() {
        console.log("Exiting test mode");
        clearBoard();
        navigate("/");
    }

    // Handle deck change in test mode
    function handleDeckChange(event: React.ChangeEvent<HTMLSelectElement>) {
        const newDeckId = String(event.target.value);
        setActiveDeck(newDeckId);
        console.log(`Test mode: Switching to deck ${newDeckId}`);
        // Automatically reinitialize with new deck using the specific deck ID
        setTimeout(() => {
            initializeTestGameWithDeck(newDeckId);
        }, 100);
    }

    // Handle modal close and reload deck (mirrors lobby implementation)
    function handleOnCloseSetImageDialog() {
        setSleeveSelectionOpen(false);
        setImageSelectionOpen(false);
        // Reload deck data after modal closes to reflect changes
        if (activeDeckId) {
            axios.get(`/api/profile/decks/${activeDeckId}`).then((res) => {
                const updatedDeck = res.data as DeckType;
                setDeckObject(updatedDeck);

                // Update the game field sleeve to match the updated deck sleeve
                const currentGameState = useGameBoardStates.getState();
                if (currentGameState.myAvatar && updatedDeck.sleeveName !== currentGameState.mySleeve) {
                    useGameBoardStates.setState({
                        mySleeve: updatedDeck.sleeveName || "Default",
                    });
                    console.log(`Test mode: Updated game field sleeve to "${updatedDeck.sleeveName}"`);
                }
            });
        }
    }

    // Mock WSUtils for components that need it (simplified for direct gameplay)
    const mockWSUtils = {
        matchInfo: { gameId: "test-mode", user, opponentName: "Test Dummy" },
        sendMessage: mockSendMessage,
        sendMoveCard,
        sendChatMessage,
        sendSfx: (sfx: string) => {
            console.log("Test mode SFX:", sfx);
            if (sfx === "playShuffleDeckSfx") playShuffleDeckSfx();
        },
        sendPhaseUpdate: () => console.log("Test mode: phase update"),
        nextPhase,
        sendUpdate: () => console.log("Test mode: send update"),
    };

    // Mouse and touch sensors for drag and drop
    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 3,
        },
    });
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 1500,
            distance: 5,
        },
    });

    // Layout
    const iconWidth = useGeneralStates((state) => state.cardWidth * 0.45);
    const boardContainerRef = useRef<HTMLDivElement>(null);
    const height = boardContainerRef.current ? Math.max(window.outerHeight - 148, 800) : undefined;

    useLayoutEffect(() => window.scrollTo(document.documentElement.scrollWidth - window.innerWidth, 0), []);

    return (
        <Container ref={boardContainerRef}>
            <GameBackground />
            <ContextMenus wsUtils={mockWSUtils} />
            <TokenModal wsUtils={mockWSUtils} />
            <EndModal />

            <DetailsContainer height={height} style={{ minHeight: window.innerHeight }}>
                {details !== DetailsView.NO_IMAGE && (
                    <CardImg
                        src={hoverCard?.imgUrl ?? selectedCard?.imgUrl ?? carbackSrc}
                        alt={"cardImg"}
                        onContextMenu={(e) => showDetailsImageMenu({ event: e })}
                        onClick={() => selectCard(null)}
                        {...(!selectedCard &&
                            !hoverCard && {
                                style: { pointerEvents: "none", opacity: 0.25, filter: "saturate(0.5)" },
                            })}
                    />
                )}
                {details === DetailsView.NO_IMAGE && <div style={{ height: "10px" }} />}
                <CardDetails />
            </DetailsContainer>

            <DndContext
                onDragEnd={handleDragEnd}
                autoScroll={false}
                collisionDetection={pointerWithin}
                sensors={[mouseSensor, touchSensor]}
            >
                <BoardLayout height={height}>
                    <SettingsContainer>
                        <SoundBar iconFontSize={iconWidth}>
                            <a
                                href="https://world.digimoncard.com/rule/pdf/general_rules.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                title={"Rulings"}
                            >
                                <StyledIconButton sx={{ color: "white", position: "relative" }}>
                                    <RulingsIcon sx={{ fontSize: `${iconWidth * 0.85}px!important`, opacity: 0.8 }} />
                                    <LinkIcon
                                        sx={{
                                            color: "dodgerblue",
                                            position: "absolute",
                                            right: 0,
                                            top: 7,
                                            fontSize: `${iconWidth * 0.4}px!important`,
                                            pointerEvents: "none",
                                        }}
                                    />
                                </StyledIconButton>
                            </a>
                            <SettingsMenuButton iconFontSize={`${iconWidth}px!important`} />
                        </SoundBar>
                    </SettingsContainer>

                    <ChatAndCardDialogContainerDiv>
                        {!stackModal && !openedCardModal && (
                            <GameChatLog matchInfo={mockWSUtils.matchInfo} sendChatMessage={sendChatMessage} />
                        )}
                        {!!openedCardModal && <CardModal />}
                        {!!stackModal && <StackModal />}
                    </ChatAndCardDialogContainerDiv>

                    <RevealArea />

                    <MemoryBar wsUtils={mockWSUtils} />
                    {/* PhaseIndicator intentionally excluded per requirements */}

                    {/* OpponentBoardSide intentionally excluded per requirements */}
                    {/* Deck selection and control buttons in center where opponent board would be */}
                    <TestControlsContainer>
                        <DeckSelectionCard>
                            <DeckSelect value={activeDeckId} onChange={handleDeckChange}>
                                {decks.map((deck) => (
                                    <option value={deck.id} key={deck.id}>
                                        {deck.name}
                                    </option>
                                ))}
                            </DeckSelect>
                            {!!deckObject?.decklist?.length && (
                                <ProfileDeck
                                    deck={deckObject}
                                    lobbyView
                                    setSleeveSelectionOpen={setSleeveSelectionOpen}
                                    setImageSelectionOpen={setImageSelectionOpen}
                                />
                            )}
                        </DeckSelectionCard>
                        <ButtonsContainer>
                            <ResetButton
                                className="button"
                                title="Reset the deck and restart test"
                                onClick={initializeTestGame}
                            >
                                RESET
                            </ResetButton>
                            <ExitButton
                                className="button"
                                title="Exit test mode and return to lobby"
                                onClick={handleExit}
                            >
                                EXIT
                            </ExitButton>
                        </ButtonsContainer>
                    </TestControlsContainer>
                    <PlayerBoardSide wsUtils={mockWSUtils} />
                </BoardLayout>

                <DragOverlayCards />
            </DndContext>

            {/* Deck sleeve selection modal */}
            <MenuDialog
                onClose={handleOnCloseSetImageDialog}
                open={sleeveSelectionOpen}
                PaperProps={{ sx: { overflow: "hidden" } }}
            >
                <CustomDialogTitle handleOnClose={handleOnCloseSetImageDialog} variant={"Sleeve"} />
                <ChooseCardSleeve />
            </MenuDialog>

            {/* Deck image selection modal */}
            <MenuDialog onClose={handleOnCloseSetImageDialog} open={imageSelectionOpen}>
                <CustomDialogTitle handleOnClose={handleOnCloseSetImageDialog} variant={"Image"} />
                <ChooseDeckImage />
            </MenuDialog>
        </Container>
    );
}

// Styled components (copied from GamePage.tsx)
const Container = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;

    position: relative;
    width: 100%;
    min-width: 100vw;
    height: 100%;
    min-height: 100vh;
    overflow-y: hidden;
    gap: 5px;
`;

const DetailsContainer = styled.div<{ height?: number }>`
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    width: 350px !important;
    max-width: 350px;
    height: ${({ height }) => (height ? `${height}px` : "unset")};
    max-height: ${({ height }) => (height ? `${height}px` : "unset")};
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    gap: 5px;
    overflow-x: hidden;
    overflow-y: scroll;
    scrollbar-width: none;
    &::-webkit-scrollbar {
        width: 0;
        display: none;
    }
`;

const CardImg = styled.img`
    width: calc(100% - 10px);
    border-radius: 3.5%;
    aspect-ratio: 5 / 7;
    z-index: 1000;
`;

const BoardLayout = styled.div<{ height?: number; isCameraTilted?: boolean }>`
    position: relative;
    aspect-ratio: 35 / 20;
    height: ${({ height }) => (height ? `${height}px` : "auto")};

    display: grid;
    grid-template-columns: repeat(35, 1fr);
    grid-template-rows: repeat(20, 1fr);

    container-type: inline-size;
    container-name: board-layout;

    transform: ${({ isCameraTilted }) =>
        isCameraTilted ? "perspective(2000px) rotateX(35deg) rotateZ(0deg)" : "unset"};
    padding: ${({ isCameraTilted }) => (isCameraTilted ? "0 3.5vw 0 5vw" : "0")};

    @supports (-moz-appearance: none) {
        height: ${({ height }) => (height ? `${height - 8}px` : "auto")};
    }
`;

const SettingsContainer = styled.div`
    grid-column: 1 / 9;
    grid-row: 1 / 3;
    z-index: 1;
`;

const StyledIconButton = styled(IconButton)`
    width: fit-content;
    opacity: 0.7;
    display: flex;
`;

const ChatAndCardDialogContainerDiv = styled.div`
    height: 95%;
    width: 95%;
    margin: 1.5%;
    padding: 0 1% 0 1%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    position: relative;
    grid-column: 29 / 36;
    grid-row: 5 / 17;

    background: rgba(12, 21, 16, 0.1);
    border: 1px solid rgba(124, 124, 118, 0.6);
    border-radius: 1%;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.09);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));

    z-index: 20;
`;

const TestControlsContainer = styled.div`
    grid-column: 4 / 32;
    grid-row: 4 / 10;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    z-index: 10;
`;

const ResetButton = styled.div`
    border-radius: 5px;
    position: relative;
    border: none !important;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 180px;
    height: 120px;
    cursor: pointer;

    background: var(--blue-button-bg);
    color: ghostwhite;
    font-family: "Frutiger", sans-serif;
    font-size: 32px;
    font-weight: bold;
    letter-spacing: 1px;

    filter: saturate(0.6);
    opacity: 0.8;

    text-shadow: 0 -2px 1px rgba(0, 0, 0, 0.25);
    box-shadow:
        inset 0 3px 10px rgba(255, 255, 255, 0.2),
        inset 0 -3px 10px rgba(0, 0, 0, 0.3);

    &:hover {
        color: ghostwhite;
        background: var(--blue-button-bg-hover);
        border: none;
    }

    &:active {
        background: var(--blue-button-bg-active);
        box-shadow:
            inset -1px -1px 1px rgba(255, 255, 255, 0.6),
            inset 1px 1px 1px rgba(0, 0, 0, 0.8);
    }
`;

const ExitButton = styled.div`
    border-radius: 5px;
    position: relative;
    border: none !important;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 180px;
    height: 120px;
    cursor: pointer;

    background: rgba(159, 39, 71, 0.8); /* Red tint background */
    color: ghostwhite;
    font-family: "Frutiger", sans-serif;
    font-size: 32px;
    font-weight: bold;
    letter-spacing: 1px;

    filter: saturate(0.8);
    opacity: 0.9;

    text-shadow: 0 -2px 1px rgba(0, 0, 0, 0.25);
    box-shadow:
        inset 0 3px 10px rgba(255, 255, 255, 0.15),
        inset 0 -3px 10px rgba(0, 0, 0, 0.4);

    &:hover {
        color: ghostwhite;
        background: rgba(206, 52, 93, 0.9); /* Lighter red on hover */
        border: none;
        filter: saturate(1);
    }

    &:active {
        background: rgba(215, 22, 73, 1); /* Darker red on active */
        box-shadow:
            inset -1px -1px 1px rgba(255, 255, 255, 0.4),
            inset 1px 1px 1px rgba(0, 0, 0, 0.8);
    }
`;

const DeckSelect = styled.select`
    width: 100%;
    padding: 6px 8px;
    border: 1px solid rgba(48, 95, 217, 0.7);
    border-radius: 3px;
    background-color: #0c0c0c;
    color: ghostwhite;
    font-family: "League Spartan", sans-serif;
    font-size: 14px;

    &:focus {
        outline: none;
        box-shadow: 0 0 5px rgba(48, 95, 217, 0.7);
    }

    option {
        background-color: #0c0c0c;
        color: ghostwhite;
    }
`;

const DeckSelectionCard = styled.div`
    width: fit-content;
    height: fit-content;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    gap: 6px; /* 6px gap between selection and ProfileDeck */

    position: relative;
    color: ghostwhite;
    background: rgba(12, 21, 16, 0.1); /* Matches chat/card modal background */
    border: 1px solid rgba(124, 124, 118, 0.6); /* Matches chat/card modal border */
    border-radius: 1%; /* Matches chat/card modal border radius */
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.09); /* Matches chat/card modal shadow */
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5)); /* Matches chat/card modal filter */
`;

const ButtonsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 20px;
`;
