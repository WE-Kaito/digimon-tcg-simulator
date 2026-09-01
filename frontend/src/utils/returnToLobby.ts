import { NavigateFunction } from "react-router-dom";
import { useGameBoardStates } from "../hooks/useGameBoardStates.ts";
import { useGameUIStates } from "../hooks/useGameUIStates.ts";

export function returnToLobby(navigate: NavigateFunction) {
    const boardState = useGameBoardStates.getState();
    const gameLobbyRoomId = boardState.gameLobbyRoomId;

    boardState.clearBoard();
    boardState.setGameId("");
    useGameUIStates.getState().setIsEndDialogOpen(false);
    localStorage.removeItem("boardStore");

    navigate(gameLobbyRoomId ? `/game_room/${gameLobbyRoomId}` : "/", { replace: true });
}
