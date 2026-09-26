type SetIsRejoinable = (isRejoinable: boolean) => void;
type SetGameId = (gameId: string) => void;

export function handleReconnectStatus(
    message: string,
    gameId: string,
    setIsRejoinable: SetIsRejoinable,
    setGameId: SetGameId
) {
    if (message.startsWith("[RECONNECT_ENABLED]:")) {
        const matchingRoomId = message.substring("[RECONNECT_ENABLED]:".length);
        setIsRejoinable(Boolean(gameId) && matchingRoomId === gameId);
        return;
    }

    if (message === "[RECONNECT_DISABLED]") {
        setIsRejoinable(false);
        if (gameId) setGameId("");
    }
}
