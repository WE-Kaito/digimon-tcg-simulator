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

function App() {

    const me = useStore((state) => state.me);
    const user = useStore((state) => state.user);

    const location = useLocation();

    useEffect(() => {
        // Update the background image based on the page
        const body = document.body;
        if (location.pathname === "/login") {
            body.style.backgroundImage = "none";
        }
    }, [location.pathname]);

    useEffect(() => {
        me();
    }, [me])

    function isMobileDevice() {
        if (window.innerWidth <= 766) {
            return TouchBackend;
        } else {
            return HTML5Backend;
        }
    }

    return (
        <DndProvider backend={isMobileDevice()}>
            <Routes>
                <Route element={<ProtectedRoutes user={user}/>}>
                    <Route path="/" element={<MainMenu/>}/>
                    <Route path="/profile" element={<Profile user={user}/>}/>
                    <Route path="/deckbuilder" element={<Deckbuilder/>}/>
                    <Route path="/update-deck/:id" element={<EditDeck/>}/>
                    <Route path="/*" element={<Navigate to="/"/>}/>
                </Route>

                <Route path="/login" element={<LoginPage/>}/>

            </Routes>
        </DndProvider>
    )
}

export default App
