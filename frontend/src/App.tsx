import "./App.css";
import { useGeneralStates } from "./hooks/useGeneralStates.ts";
import { useEffect } from "react";
import { initParticlesEngine } from "@tsparticles/react";
import { loadSlim } from "@tsparticles/slim";
import { useDeckStates } from "./hooks/useDeckStates.ts";
import { Navigate, Route, Routes, useParams } from "react-router-dom";
import Profile from "./pages/Profile.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RecoveryPage from "./pages/RecoveryPage.tsx";
import ProtectedRoutes from "./components/ProtectedRoutes.tsx";
import Lobby from "./pages/Lobby.tsx";
import CustomToastContainer from "./components/CustomToastContainer.tsx";
import GamePage from "./pages/GamePage.tsx";
import Decks from "./pages/Decks.tsx";
import Deckbuilder from "./pages/Deckbuilder.tsx";
import DeckTest from "./pages/DeckTest.tsx";
import Administration from "./pages/Administration.tsx";
import { useGameBoardStates } from "./hooks/useGameBoardStates.ts";

function App() {
    const me = useGeneralStates((state) => state.me);
    const user = useGeneralStates((state) => state.user);
    const fetchCards = useDeckStates((state) => state.fetchCards);
    const fetchDecks = useDeckStates((state) => state.fetchDecks);
    const setParticlesInitialized = useGeneralStates((state) => state.setParticlesInitialized);

    useEffect(() => {
        me();
    }, [me]);

    useEffect(() => {
        fetchCards();
    }, [fetchCards]);

    useEffect(() => {
        if (user.length && user !== "anonymousUser") fetchDecks();
    }, [fetchDecks, user]);

    useEffect(() => {
        initParticlesEngine(async (engine) => await loadSlim(engine)).then(() => setParticlesInitialized(true));
    }, [setParticlesInitialized]);

    return (
        <>
            <CustomToastContainer />
            <Routes>
                <Route element={<ProtectedRoutes />}>
                    <Route path="/" element={<Lobby />} />
                    <Route path="/game_room/:roomId" element={<Lobby />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/decks" element={<Decks />} />
                    <Route path="/deckbuilder" element={<Deckbuilder />} />
                    <Route path="/deckbuilder/:id" element={<Deckbuilder />} />
                    <Route path="/game/:gameId" element={<GameRoute />} />
                    <Route path="/test" element={<DeckTest />} />
                    <Route path="/administration" element={<Administration />} />
                    <Route path="/*" element={<Navigate to="/" />} />
                </Route>

                <Route path="/login" element={<LoginPage />} />
                <Route path="/recover-password" element={<RecoveryPage />} />
            </Routes>
        </>
    );
}

function GameRoute() {
    const { gameId } = useParams<{ gameId: string }>();
    const storedGameId = useGameBoardStates((state) => state.gameId);
    const setGameId = useGameBoardStates((state) => state.setGameId);

    useEffect(() => {
        if (gameId && storedGameId !== gameId) setGameId(gameId);
    }, [gameId, setGameId, storedGameId]);

    if (!gameId) return <Navigate to="/" replace />;
    if (storedGameId !== gameId) return null;
    return <GamePage />;
}

export default App;
