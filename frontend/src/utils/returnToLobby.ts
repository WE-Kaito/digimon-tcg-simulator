import { NavigateFunction } from "react-router-dom";
import { useGameBoardStates } from "../hooks/useGameBoardStates.ts";
import { useGameUIStates } from "../hooks/useGameUIStates.ts";

export function returnToLobby(navigate: NavigateFunction) {
    const boardState = useGameBoardStates.getState();

    boardState.clearBoard();
    boardState.setGameId("");
    boardState.setGameLobbyRoomId("");
    useGameUIStates.getState().setIsEndDialogOpen(false);
    localStorage.removeItem("boardStore");

    navigate("/", { replace: true });
}
