import './App.css'
import Deckbuilder from "./pages/Deckbuilder.tsx";
import EditDeck from "./pages/EditDeck.tsx";
import {DndProvider} from "react-dnd";
import {TouchBackend} from "react-dnd-touch-backend";
import {HTML5Backend} from "react-dnd-html5-backend";
import {Navigate, Route, Routes} from "react-router-dom";
import Profile from "./pages/Profile.tsx";
import MainMenu from "./pages/MainMenu.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import {useStore} from "./hooks/useStore.ts";
import {useEffect} from "react";

function App() {

    const me = useStore((state) => state.me);

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
                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/" element={<MainMenu/>}/>
                <Route path="/profile" element={<Profile/>}/>
                <Route path="/deckbuilder" element={<Deckbuilder/>}/>
                <Route path="/update-deck/:id" element={<EditDeck/>}/>
                <Route path="/*" element={<Navigate to="/"/>}/>
            </Routes>
        </DndProvider>
    )
}

export default App
