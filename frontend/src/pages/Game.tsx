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

            <Wrapper>
                <InfoContainer></InfoContainer>

                <FieldContainer>
                    <div style={{display: "flex"}}>
                        <OpponentContainerMain>
                            <div style={{display: "flex", flexDirection: "column", gridArea: "player"}}>
                                <img alt="opponent" src={profilePicture(opponentAvatar)}/>
                                <span>{opponentName}</span>
                            </div>
                        </OpponentContainerMain>
                        <OpponentContainerSide></OpponentContainerSide>
                    </div>

                    <EnergyBarContainer></EnergyBarContainer>

                    <div style={{display: "flex"}}>
                        <MyContainerSide></MyContainerSide>
                        <MyContainerMain>
                            <div style={{display: "flex", flexDirection: "column", gridArea: "player"}}>
                                <span>{user}</span>
                                <img alt="me" src={profilePicture(myAvatar)}
                                     onClick={() => setSurrenderOpen(!surrenderOpen)}
                                     style={{cursor: "pointer"}}/>
                            </div>
                        </MyContainerMain>
                    </div>
                </FieldContainer>
            </Wrapper>
        </>
    );
}

const MyContainerMain = styled.div`
  height: 450px;
  width: 1005px;
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  grid-template-rows: 1.2fr 1fr;
  grid-template-areas: "digi1 digi1 digi2 digi2 digi3 digi3 digi4 digi4 digi5 digi5 trash trash deck deck"
                        "delay delay tamer tamer tamer hand hand hand hand hand hand player player player";
`;

const OpponentContainerMain = styled.div`
  height: 450px;
  width: 1005px;
  display: grid;
  grid-template-columns: repeat(14, 1fr);
  grid-template-rows: 1fr 1.2fr;
  grid-template-areas: "player player player hand hand hand hand hand hand tamer tamer tamer delay delay"
                        "deck deck trash trash digi5 digi5 digi4 digi4 digi3 digi3 digi2 digi2 digi1 digi1";
`;

const MyContainerSide = styled.div`
  height: 450px;
  width: 285px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1fr 1.5fr;
  grid-template-areas: "security-stack security-stack"
                        "egg-deck breed";
`;

const OpponentContainerSide = styled.div`
  height: 450px;
  width: 285px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: 1.5fr 1fr;
  grid-template-areas: "egg-deck breed"
                        "security-stack security-stack";
`;

const EnergyBarContainer = styled.div`
  height: 100px;
  width: 1005px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const InfoContainer = styled.div`
  height: 1000px;
  width: 310px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const FieldContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Wrapper = styled.div`
  height: 1000px;
  width: 1600px;
  display: flex;
  background: rgba(47, 45, 45, 0.45);
  

  @media (max-height: 1199px) {
    transform: scale(1);
  }
  
  @media (max-height: 1080px) {
    transform: scale(0.9);
  }
  @media (max-height: 900px) {
    transform: scale(0.7);
  }

  @media (min-height: 1200px) {
    transform: scale(1.5);
  }
`;