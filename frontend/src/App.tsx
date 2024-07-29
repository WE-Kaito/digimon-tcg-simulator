import './App.css'
import Deckbuilder from "./pages/Deckbuilder.tsx";
import {DndProvider} from "react-dnd";
import {TouchBackend} from "react-dnd-touch-backend";
import {HTML5Backend} from "react-dnd-html5-backend";
import {Navigate, Route, Routes} from "react-router-dom";
import Profile from "./pages/Profile.tsx";
import MainMenu from "./pages/MainMenu.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import RecoveryPage from "./pages/RecoveryPage.tsx";
import {useStore} from "./hooks/useStore.ts";
import {useEffect} from "react";
import ProtectedRoutes from "./components/ProtectedRoutes.tsx";
import Lobby from "./pages/Lobby.tsx";
import CustomToastContainer from "./components/CustomToastContainer.tsx";
import GamePage from "./pages/GamePage.tsx";

function App() {

    const me = useStore((state) => state.me);
    const user = useStore((state) => state.user);

    useEffect(() => me(), [me]);

    function getDndBackend() {
        if (('ontouchstart' in window || navigator.maxTouchPoints) && window.innerWidth < 1000) {
            return TouchBackend;
        } else {
            return HTML5Backend;
        }
    }

    return (
        <>
            <CustomToastContainer/>
                <Routes>
                    <Route element={<ProtectedRoutes user={user}/>}>
                        <Route path="/" element={<MainMenu/>}/>
                        <Route path="/profile" element={<Profile user={user}/>}/>
                        <Route path="/deckbuilder" element={<Deckbuilder/>}/>
                        <Route path="/update-deck" element={<Deckbuilder isEditMode/>}/>
                        <Route path="/lobby" element={<Lobby user={user}/>}/>
                        <Route path="/game" element={
                            <DndProvider backend={getDndBackend()}>
                                    <GamePage/>
                            </DndProvider>
                        }/>
                        <Route path="/*" element={<Navigate to="/"/>}/>
                    </Route>

                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/recover-password" element={<RecoveryPage/>}/>
                </Routes>
        </>
    )
}

export default App
