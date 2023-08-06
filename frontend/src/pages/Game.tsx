import {useStore} from "../hooks/useStore.ts";
import useWebSocket from "react-use-websocket";
import {useNavigate} from "react-router-dom";
import {Player} from "../utils/types.ts";
import {useGame} from "../hooks/useGame.ts";
import {profilePicture} from "../utils/functions.ts";
import {useEffect, useState} from "react";
import styled from "@emotion/styled";
import SurrenderMoodle from "../components/game/SurrenderMoodle.tsx";

export default function Game({user}: { user: string }) {

    const currentPort = window.location.port;
    const websocketURL = currentPort === "5173" ? "ws://localhost:8080/api/ws/game" : "wss://cgn-java-23-2-enrico.capstone-project.de/api/ws/chat";
    const navigate = useNavigate();

    const gameId = useStore((state) => state.gameId);
    const setUpGame = useGame((state) => state.setUpGame);

    const myAvatar = useGame((state) => state.myAvatar);
    const opponentAvatar = useGame((state) => state.opponentAvatar);
    const opponentName = useGame((state) => state.opponentName);

    const [surrenderOpen, setSurrenderOpen] = useState<boolean>(false);
    const [timerOpen, setTimerOpen] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(5);
    const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

    const websocket = useWebSocket(websocketURL, {

        onOpen: () => {
            websocket.sendMessage("/startGame:" + gameId);
        },

        onMessage: (event) => {

            if (event.data.startsWith("[START_GAME]:")) {
                const playersJson = event.data.substring("[START_GAME]:".length);
                const players = JSON.parse(playersJson);
                const me = players.filter((player: Player) => player.username === user)[0];
                const opponent = players.filter((player: Player) => player.username !== user)[0];
                setUpGame(me, opponent);
            }

            if (event.data === "[SURRENDER]") {
                startTimer();
            }

            if (event.data === "[PLAYER_LEFT]") {
                setOpponentLeft(true);
                startTimer();
            }
        }
    });

    useEffect(() => {
        setOpponentLeft(false);
        setTimer(5);
        setTimerOpen(false);
        setSurrenderOpen(false);
    }, []);

    useEffect(() => {
        if (timer === 0) navigate("/lobby");
    }, [timer, navigate]);

    function handleSurrender() {
        websocket.sendMessage(`${gameId}:/surrender:${opponentName}`);
        startTimer();
    }

    function startTimer() {
        setTimerOpen(true);
        for (let i = 5; i > 0; i--) {
            setTimeout(() => {
                setTimer((timer) => timer - 1);
            }, i * 1000);
        }
    }

    return (
        <>
        {(surrenderOpen || timerOpen) &&
            <SurrenderMoodle timer={timer} timerOpen={timerOpen} surrenderOpen={surrenderOpen}
                             setSurrenderOpen={setSurrenderOpen} opponentLeft={opponentLeft}
                             handleSurrender={handleSurrender}/>}

        <h1>Game</h1>

        <div style={{display: "flex", flexDirection: "column"}}>
            <span>{opponentName}</span>
            <img alt="opponent" src={profilePicture(opponentAvatar)}/>
        </div>
        <h2>VS.</h2>
        <div style={{display: "flex", flexDirection: "column"}}>
            <span>{user}</span>
            <img alt="me" src={profilePicture(myAvatar)} onClick={() => setSurrenderOpen(!surrenderOpen)}
                 style={{cursor: "pointer"}}/>
        </div>
        </>
    );
}

