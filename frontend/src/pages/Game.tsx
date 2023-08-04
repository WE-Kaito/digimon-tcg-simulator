import {useStore} from "../hooks/useStore.ts";
import useWebSocket from "react-use-websocket";
import {useNavigate} from "react-router-dom";
import {Player} from "../utils/types.ts";
import {useGame} from "../hooks/useGame.ts";
import {profilePicture} from "../utils/functions.ts";
import {useEffect, useState} from "react";
import styled from "@emotion/styled";

export default function Game({user}: { user: string }) {

    const gameId = useStore((state) => state.gameId);
    const setUpGame = useGame((state) => state.setUpGame);
    const navigate = useNavigate();

    const myAvatar = useGame((state) => state.myAvatar);
    const opponentAvatar = useGame((state) => state.opponentAvatar);
    const opponentName = useGame((state) => state.opponentName);

    const [surrenderOpen, setSurrenderOpen] = useState(false);
    const [timerOpen, setTimerOpen] = useState(false);
    const [timer, setTimer] = useState(5);

    const websocket = useWebSocket("ws://localhost:8080/api/ws/game", {

        onOpen: () => {
            websocket.sendMessage("/startGame:" + gameId);
        },

        onMessage: (event) => {

            if (event.data.startsWith("[START_GAME]:")) {
                const playersJson = event.data.substring("[START_GAME]:".length);
                const players = JSON.parse(playersJson);
                const me = players.filter((player: Player) => player.username === user)[0];
                const opponent = players.filter((player: Player) => player.username !== user)[0]
                setUpGame(me, opponent);
            } else {
                console.log("Received message: " + event.data);
            }
        }
    });

    useEffect(() => {
        if (timer === 0) navigate("/lobby");
    }, [timer]);

    function handleSurrender() {
        websocket.sendMessage(`${gameId}:/surrender:${user}`);
        setTimerOpen(true);
        for (let i = 5; i > 0; i--) {
            setTimeout(() => {
                setTimer((timer) => timer - 1);
            }, i * 1000);
        }
    }

    return (
        <>
            {surrenderOpen &&
                <SurrenderMoodle>
                    {!timerOpen ?
                        (<>
                            <SurrenderSpan>Do you really want to surrender?</SurrenderSpan>
                            <div style={{width: 390, display: "flex", justifyContent: "space-between"}}>
                                <CancelSurrenderButton
                                    onClick={() => setSurrenderOpen(!surrenderOpen)}>CANCEL</CancelSurrenderButton>
                                <SurrenderButton onClick={handleSurrender}>SURRENDER</SurrenderButton>
                            </div>
                        </>)
                        :
                        (<>
                            <SurrenderSpan>You surrendered. GAME ENDING...</SurrenderSpan>
                            <SurrenderSpan style={{fontFamily:"Awsumsans, sans-serif"}}>{timer}</SurrenderSpan>
                        </>)
                    }
                </SurrenderMoodle>}

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

const SurrenderMoodle = styled.div`
  position: absolute;
  width: 560px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 30px;
  background: #0c0c0c;
  transition: all 0.2s ease;

  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const SurrenderSpan = styled.span`
  font-family: Pixel Digivolve, sans-serif;
  font-size: 24px;
  text-shadow: black 2px 4px 2px;
`;

const CancelSurrenderButton = styled.button`
  cursor: pointer;
  width: 160px;
  height: 50px;
  flex-shrink: 0;
  border-radius: 0;
  background: #D9D9D9;
  font-family: Pixel Digivolve, sans-serif;
  font-size: 20px;
  color: #0c0c0c;
  box-shadow: 6px 12px 1px 0 rgb(0, 0, 0);
  transition: all 0.15s ease;

  &:hover {
    background: lightgray;
    transform: translateY(1px);
    box-shadow: 4px 8px 1px 0 rgba(0, 0, 0, 0.9);
  }

  &:focus {
    outline: none;
  }

  &:active {
    background: #f8f8f8;
    transform: translateY(2px);
    box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.8);
  }
`;

const SurrenderButton = styled(CancelSurrenderButton)`
  background-color: #c03427;

  &:hover {
    background: #da483b;
  }

  &:active {
    background: #e72737;
  }
`;