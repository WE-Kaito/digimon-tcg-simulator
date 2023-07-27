import './App.css'
import Deckbuilder from "./pages/Deckbuilder.tsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

function App() {
    return (<DndProvider backend={HTML5Backend}>
            <Deckbuilder/>
        </DndProvider>
    )
}

export default App
