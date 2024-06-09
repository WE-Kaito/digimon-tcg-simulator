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
import Game from "./pages/Game.tsx";
import CustomToastContainer from "./components/CustomToastContainer.tsx";
import {initParticlesEngine} from "@tsparticles/react";
import {loadSlim} from "@tsparticles/slim";
import MenuBackgroundWrapper from "./components/MenuBackgroundWrapper.tsx";
function App() {

    const me = useStore((state) => state.me);
    const user = useStore((state) => state.user);
    const setParticlesInit = useStore((state) => state.setParticlesInit);

    useEffect(() => me(), [me]);

    useEffect(() => {
        initParticlesEngine(async (engine) => await loadSlim(engine)).then(() => setParticlesInit(true))
        // eslint-disable-next-line
    }, []);

    function isMobileDevice() {
        if (('ontouchstart' in window || navigator.maxTouchPoints) && window.innerWidth < 1000) {
            return TouchBackend;
        } else {
            return HTML5Backend;
        }
    }

    return (
        <DndProvider backend={isMobileDevice()}>

            <CustomToastContainer/>
            <MenuBackgroundWrapper>
                <Routes>
                    <Route element={<ProtectedRoutes user={user}/>}>
                        <Route path="/" element={<MainMenu/>}/>
                        <Route path="/profile" element={<Profile user={user}/>}/>
                        <Route path="/deckbuilder" element={<Deckbuilder/>}/>
                        <Route path="/update-deck" element={<Deckbuilder isEditMode/>}/>
                        <Route path="/lobby" element={<Lobby user={user}/>}/>
                        <Route path="/game" element={<Game user={user}/>}/>
                        <Route path="/*" element={<Navigate to="/"/>}/>
                    </Route>

                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/recover-password" element={<RecoveryPage/>}/>
                </Routes>
            </MenuBackgroundWrapper>
        </DndProvider>
    )
}

export default App
