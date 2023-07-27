import './App.css'
import Deckbuilder from "./pages/Deckbuilder.tsx";
import { DndProvider } from "react-dnd";
import { TouchBackend } from "react-dnd-touch-backend";
import {HTML5Backend} from "react-dnd-html5-backend";

function App() {

    function isMobileDevice() {
        if (window.innerWidth <= 766){
            return TouchBackend;
        } else {
            return HTML5Backend;
        }
    }

    return (<DndProvider backend={isMobileDevice()}>
            <Deckbuilder/>
        </DndProvider>
    )
}

export default App
