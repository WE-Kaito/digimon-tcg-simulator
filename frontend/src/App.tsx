import './App.css'
import Deckbuilder from "./pages/Deckbuilder.tsx";
import EditDeck from "./pages/EditDeck.tsx";
import {DndProvider} from "react-dnd";
import {TouchBackend} from "react-dnd-touch-backend";
import {HTML5Backend} from "react-dnd-html5-backend";
import {Navigate, Route, Routes, useLocation} from "react-router-dom";
import Profile from "./pages/Profile.tsx";
import MainMenu from "./pages/MainMenu.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import {useStore} from "./hooks/useStore.ts";
import {useEffect} from "react";
import ProtectedRoutes from "./components/ProtectedRoutes.tsx";
import Lobby from "./pages/Lobby.tsx";
import Game from "./pages/Game.tsx";
import {StyledToastContainer} from "./components/game/StyledToastContainer.ts";
function App() {

    const me = useStore((state) => state.me);
    const user = useStore((state) => state.user);

    const location = useLocation();

    useEffect(() => {
        const body = document.body;

        switch (location.pathname) {
            case "/":
                body.className = "main-background";
                break;
            case "/profile":
                body.className = "main-background";
                break;
            case "/deckbuilder":
                body.className = "main-background";
                break;
            case "/update-deck":
                body.className = "main-background";
                break;
            case "/login":
                body.className = "login-background";
                break;
            case "/lobby":
                body.className = "lobby-background";
                break;
            default:
                body.className = "main-background";
                break;
        }
    }, [location.pathname]);

    useEffect(() => {
        me();
    }, [me])

    function isMobileDevice() {
        if ('ontouchstart' in window || navigator.maxTouchPoints) {
            return TouchBackend;
        } else {
            return HTML5Backend;
        }
    }

    return (
        <DndProvider backend={isMobileDevice()}>

            <StyledToastContainer/>

            <Routes>
                <Route element={<ProtectedRoutes user={user}/>}>
                    <Route path="/" element={<MainMenu/>}/>
                    <Route path="/profile" element={<Profile user={user}/>}/>
                    <Route path="/deckbuilder" element={<Deckbuilder/>}/>
                    <Route path="/update-deck/:id" element={<EditDeck/>}/>
                    <Route path="/lobby" element={<Lobby user={user}/>}/>
                    <Route path="/game" element={<Game user={user}/>}/>
                    <Route path="/*" element={<Navigate to="/"/>}/>
                </Route>

                <Route path="/login" element={<LoginPage/>}/>

            </Routes>

        </DndProvider>
    )
}

export default App
