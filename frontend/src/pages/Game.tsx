import {useStore} from "../hooks/useStore.ts";
import useWebSocket from "react-use-websocket";
import {useNavigate} from "react-router-dom";
import {DraggedItem, GameDistribution, Player} from "../utils/types.ts";
import {useGame} from "../hooks/useGame.ts";
import {profilePicture} from "../utils/functions.ts";
import {useEffect, useState} from "react";
import styled from "@emotion/styled";
import SurrenderMoodle from "../components/game/SurrenderMoodle.tsx";
import deckBack from "../assets/deckBack.png";
import eggBack from "../assets/eggBack.jpg";
import mySecurityStack from "../assets/mySecurityStack.png";
import opponentSecurityStack from "../assets/opponentSecurityStack.png";
import Card from "../components/Card.tsx";
import cardBack from "../assets/cardBack.jpg";
import CardDetails from "../components/CardDetails.tsx";
import {useDrop} from "react-dnd";

export default function Game({user}: { user: string }) {

    const currentPort = window.location.port;
    const websocketURL = currentPort === "5173" ? "ws://localhost:8080/api/ws/game" : "wss://cgn-java-23-2-enrico.capstone-project.de/api/ws/game";
    const navigate = useNavigate();

    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);

    const gameId = useStore((state) => state.gameId);
    const setUpGame = useGame((state) => state.setUpGame);
    const distributeCards = useGame((state) => state.distributeCards);

    const moveCard = useGame((state) => state.moveCard);

    const myAvatar = useGame((state) => state.myAvatar);
    const opponentAvatar = useGame((state) => state.opponentAvatar);
    const opponentName = useGame((state) => state.opponentName);

    const [surrenderOpen, setSurrenderOpen] = useState<boolean>(false);
    const [timerOpen, setTimerOpen] = useState<boolean>(false);
    const [timer, setTimer] = useState<number>(5);
    const [opponentLeft, setOpponentLeft] = useState<boolean>(false);

    const memory = useGame((state) => state.memory);
    const myHand = useGame((state) => state.myHand);
    const myDeckField = useGame((state) => state.myDeckField);
    const myEggDeck = useGame((state) => state.myEggDeck);
    const myTrash = useGame((state) => state.myTrash);
    const mySecurity = useGame((state) => state.mySecurity);
    const myTamer = useGame((state) => state.myTamer);
    const myDelay = useGame((state) => state.myDelay);

    const myDigi1 = useGame((state) => state.myDigi1);
    const myDigi2 = useGame((state) => state.myDigi2);
    const myDigi3 = useGame((state) => state.myDigi3);
    const myDigi4 = useGame((state) => state.myDigi4);
    const myDigi5 = useGame((state) => state.myDigi5);
    const myBreedingArea = useGame((state) => state.myBreedingArea);

    const opponentHand = useGame((state) => state.opponentHand);
    const opponentDeckField = useGame((state) => state.opponentDeckField);
    const opponentEggDeck = useGame((state) => state.opponentEggDeck);
    const opponentTrash = useGame((state) => state.opponentTrash);
    const opponentSecurity = useGame((state) => state.opponentSecurity);
    const opponentTamer = useGame((state) => state.opponentTamer);
    const opponentDelay = useGame((state) => state.opponentDelay);

    const opponentDigi1 = useGame((state) => state.opponentDigi1);
    const opponentDigi2 = useGame((state) => state.opponentDigi2);
    const opponentDigi3 = useGame((state) => state.opponentDigi3);
    const opponentDigi4 = useGame((state) => state.opponentDigi4);
    const opponentDigi5 = useGame((state) => state.opponentDigi5);
    const opponentBreedingArea = useGame((state) => state.opponentBreedingArea);

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

            if (event.data.startsWith("[DISTRIBUTE_CARDS]:")) {
                const newGame: GameDistribution = JSON.parse(event.data.substring("[DISTRIBUTE_CARDS]:".length));
                distributeCards(user, newGame, gameId);
            }

            (event.data === "[SURRENDER]") && startTimer();

            if (event.data === "[PLAYER_LEFT]") {
                // setOpponentLeft(true);
                // startTimer();
            }
        }
    });

    const [, dropToDigi1] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            moveCard(id, location, 'myDigi1');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi2] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            moveCard(id, location, 'myDigi2');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi3] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            moveCard(id, location, 'myDigi3');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi4] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            moveCard(id, location, 'myDigi4');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    const [, dropToDigi5] = useDrop(() => ({
        accept: "card",
        drop: (item: DraggedItem) => {
            const {id, location} = item;
            moveCard(id, location, 'myDigi5');
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    }));

    useEffect(() => {
        // TODO: useGame.sendUpdateToServer(websocket, gameId);
    }, [memory, myHand, myDeckField, myEggDeck, myTrash, mySecurity, myTamer, myDelay, myDigi1, myDigi2, myDigi3, myDigi4, myDigi5, myBreedingArea, opponentHand, opponentDeckField, opponentEggDeck, opponentTrash, opponentSecurity, opponentTamer, opponentDelay, opponentDigi1, opponentDigi2, opponentDigi3, opponentDigi4, opponentDigi5, opponentBreedingArea]);

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
        <BackGround>
            <BackGroundPattern/>
            {(surrenderOpen || timerOpen) &&
                <SurrenderMoodle timer={timer} timerOpen={timerOpen} surrenderOpen={surrenderOpen}
                                 setSurrenderOpen={setSurrenderOpen} opponentLeft={opponentLeft}
                                 handleSurrender={handleSurrender}/>}

            <Wrapper>
                <InfoContainer>
                    <InfoSpan>
                        <a href="https://world.digimoncard.com/rule/pdf/manual.pdf?070723" target="_blank"
                           rel="noopener noreferrer">
                            <span style={{color: "dodgerblue"}}>🛈 </span>Manual
                        </a>
                        <a href="https://world.digimoncard.com/rule/pdf/general_rules.pdf" target="_blank"
                           rel="noopener noreferrer">
                            <span style={{color: "dodgerblue"}}>🛈 </span>Rulings
                        </a>
                    </InfoSpan>
                    <CardImage src={(hoverCard ?? selectedCard)?.image_url ?? cardBack}
                               alt={selectedCard?.name ?? "Card"}/>
                    <CardDetails/>
                </InfoContainer>

                <FieldContainer>
                    <div style={{display: "flex"}}>
                        <OpponentContainerMain>

                            <PlayerContainer>
                                <img alt="opponent" src={profilePicture(opponentAvatar)}
                                     style={{width: "160px", border: "#0c0c0c solid 2px"}}/>
                                <UserName>{opponentName}</UserName>
                            </PlayerContainer>

                            <OpponentDeckContainer>
                                <img alt="deck" src={deckBack} width="105px"/>
                            </OpponentDeckContainer>

                            <OpponentTrashContainer>
                                {opponentTrash.length === 0 && <TrashPlaceholder>Trash</TrashPlaceholder>}
                            </OpponentTrashContainer>

                            <BattleArea1></BattleArea1>
                            <BattleArea2></BattleArea2>
                            <BattleArea3>
                                {opponentDigi3.length === 0 && <span>Battle Area</span>}
                            </BattleArea3>
                            <BattleArea4></BattleArea4>
                            <BattleArea5></BattleArea5>

                            <DelayAreaContainer style={{marginTop: "1px"}}>
                                {opponentDelay.length === 0 && <span>Delay</span>}
                            </DelayAreaContainer>

                            <TamerAreaContainer>
                                {opponentTamer.length === 0 && <span>Tamers</span>}
                            </TamerAreaContainer>

                            <HandContainer>
                                <HandCards>
                                    {opponentHand.map((card, index) => <HandListItem cardCount={opponentHand.length}
                                                                                     cardIndex={index}
                                                                                     key={card.id}><OppenentHandCard
                                        alt="card"
                                        src={cardBack}/>
                                    </HandListItem>)}
                                </HandCards>

                            </HandContainer>

                        </OpponentContainerMain>

                        <OpponentContainerSide>
                            <EggDeckContainer>
                                {opponentEggDeck.length !== 0 && <img alt="egg-deck" src={eggBack} width="105px"/>}
                            </EggDeckContainer>

                            <SecurityStackContainer>
                                <OpponentSecuritySpan>{opponentSecurity.length}</OpponentSecuritySpan>
                                <img alt="security-stack" src={opponentSecurityStack}/>
                            </SecurityStackContainer>

                            <BreedingAreaContainer>
                                {opponentBreedingArea.length === 0 && <span>Breeding<br/>Area</span>}
                            </BreedingAreaContainer>

                        </OpponentContainerSide>
                    </div>

                    <EnergyBarContainer></EnergyBarContainer>

                    <div style={{display: "flex"}}>
                        <MyContainerSide>
                            <EggDeckContainer>
                                {myEggDeck.length !== 0 && <EggDeck alt="egg-deck" src={eggBack}/>}
                            </EggDeckContainer>

                            <SecurityStackContainer>
                                <MySecuritySpan>{mySecurity.length}</MySecuritySpan>
                                <img alt="security-stack" src={mySecurityStack}/>
                            </SecurityStackContainer>

                            <BreedingAreaContainer>
                                {myBreedingArea.length === 0 && <span>Breeding<br/>Area</span>}
                            </BreedingAreaContainer>
                        </MyContainerSide>

                        <MyContainerMain>

                            <PlayerContainer>
                                <UserName>{user}</UserName>
                                <PlayerImage alt="me" src={profilePicture(myAvatar)}
                                             onClick={() => setSurrenderOpen(!surrenderOpen)}/>
                            </PlayerContainer>

                            <DeckContainer>
                                <Deck alt="deck" src={deckBack}/>
                            </DeckContainer>

                            <TrashContainer>
                                {myTrash.length === 0 && <TrashPlaceholder>Trash</TrashPlaceholder>}
                            </TrashContainer>

                            <BattleArea1 ref={dropToDigi1}>
                                {myDigi1.map((card, index) => <CardContainer key={card.id} cardIndex={index}><Card card={card} location={"myDigi1"} /></CardContainer>)}
                            </BattleArea1>
                            <BattleArea2 ref={dropToDigi2}>
                                {myDigi2.map((card, index) => <CardContainer key={card.id} cardIndex={index}><Card card={card} location={"myDigi2"} /></CardContainer>)}
                            </BattleArea2>
                            <BattleArea3 ref={dropToDigi3}>
                                {myDigi3.length === 0 && <span>Battle Area</span>}
                                {myDigi3.map((card, index) => <CardContainer key={card.id} cardIndex={index}><Card card={card} location={"myDigi3"} /></CardContainer>)}
                            </BattleArea3>
                            <BattleArea4 ref={dropToDigi4}>
                                {myDigi4.map((card, index) => <CardContainer key={card.id} cardIndex={index}><Card card={card} location={"myDigi4"} /></CardContainer>)}
                            </BattleArea4>
                            <BattleArea5 ref={dropToDigi5}>
                                {myDigi5.map((card, index) => <CardContainer key={card.id} cardIndex={index}><Card card={card} location={"myDigi5"} /></CardContainer>)}
                            </BattleArea5>

                            <DelayAreaContainer style={{marginBottom: "1px"}}>
                                {myDelay.length === 0 && <span>Delay</span>}
                            </DelayAreaContainer>

                            <TamerAreaContainer>
                                {myTamer.length === 0 && <span>Tamers</span>}
                            </TamerAreaContainer>

                            <HandContainer>
                                <HandCards>
                                    {myHand.map((card, index) => <HandListItem cardCount={myHand.length}
                                                                               cardIndex={index} key={card.id}><Card
                                        card={card} location={"myHand"}/></HandListItem>)}
                                </HandCards>
                            </HandContainer>

                        </MyContainerMain>
                    </div>
                </FieldContainer>
            </Wrapper>
        </BackGround>
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
  grid-template-areas: "breed egg-deck"
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
  overflow: hidden;
  display: flex;
  flex-direction: column;
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
  border-radius: 15px;

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

// Player

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  grid-area: player;
  align-items: center;
  justify-content: center;
`;

const PlayerImage = styled.img`
  cursor: pointer;
  width: 160px;
  border: #0c0c0c solid 2px;
  transition: all 0.1s ease;

  &:hover {
    filter: drop-shadow(0 0 2px #eceaea);
    border: #eceaea solid 2px;
  }
`;

const UserName = styled.span`
  font-size: 20px;
  align-self: flex-start;
  margin-left: 27px;
  font-family: 'Cousine', sans-serif;
`;

// Fields

const DeckContainer = styled.div`
  grid-area: deck;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  padding: 0 0 10px 10px;
`;

const OpponentDeckContainer = styled.div`
  grid-area: deck;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 10px 10px 0 0;
`;

const Deck = styled.img`
  width: 105px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.1s ease;

  &:hover {
    filter: drop-shadow(0 0 1px #eceaea);
  }
`;

const EggDeck = styled(Deck)`
  &:hover {
    filter: drop-shadow(0 0 3px #dd33e8);
    outline: #dd33e8 solid 1px;
  }
`;

const TrashContainer = styled.div`
  grid-area: trash;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  padding: 10px 10px 0 0;
`;

const OpponentTrashContainer = styled.div`
  grid-area: trash;
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  padding: 0 0 10px 10px;
`;

const EggDeckContainer = styled.div`
  grid-area: egg-deck;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 0 10px 10px;
`;

const SecurityStackContainer = styled.div`
  cursor: pointer;
  position: relative;
  grid-area: security-stack;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const MySecuritySpan = styled.span`
  position: absolute;
  z-index: 5;
  font-family: Awsumsans, sans-serif;
  font-size: 35px;
  color: #0c0c0c;
  text-shadow: #0e6cc7 1px 1px 1px;
  left: 175px;
`;

const OpponentSecuritySpan = styled(MySecuritySpan)`
  text-shadow: #c70e3f 1px 1px 1px;
  left: 90px;
`;

const CardContainer = styled.div<{cardIndex: number}>`
  position: absolute;
  bottom: ${props => (props.cardIndex * 20) + 5}px;
`;

const BattleAreaContainer = styled.div`
  position: relative;
  height: 100%;
  max-height: 100%;
  border-radius: 2px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  outline: rgba(255, 255, 255, 0.5) solid 1px;
`;

const BattleArea1 = styled(BattleAreaContainer)`
  grid-area: digi1;`;

const BattleArea2 = styled(BattleAreaContainer)`
  grid-area: digi2;`;

const BattleArea3 = styled(BattleAreaContainer)`
  grid-area: digi3;`;

const BattleArea4 = styled(BattleAreaContainer)`
  grid-area: digi4;`;

const BattleArea5 = styled(BattleAreaContainer)`
  grid-area: digi5;`;

const BreedingAreaContainer = styled(BattleAreaContainer)`
  margin: 1px;
  grid-area: breed;
`;

const DelayAreaContainer = styled(BattleAreaContainer)`
  grid-area: delay;
`;

const TamerAreaContainer = styled(BattleAreaContainer)`
  margin: 1px 0 1px 0;
  grid-area: tamer;
  flex-direction: row;
`;

const HandContainer = styled.div`
  grid-area: hand;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  width: 100%;
  height: 100%;
  padding: 5px;
`;

const HandCards = styled.ul`
  padding: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 100%;
  height: 100%;
  list-style-type: none;
  position: relative;
  clear: both;
`;

const HandListItem = styled.li<{ cardCount: number, cardIndex: number }>`
  position: absolute;
  margin: 0;
  padding: 0;
  list-style-type: none;
  float: left;
  left: 5px;
  transform: translateX(calc((${({cardIndex}) => cardIndex} * 400px) / ${({cardCount}) => cardCount}));
  //TODO: improve this after drawing cards
  &:hover {
    z-index: 100;
  }
`;

const OppenentHandCard = styled.img`
  width: 69.5px;
  max-height: 150px;
  border-radius: 5px;

  @media (max-width: 767px) {
    max-height: 115px;
  }

  @media (min-width: 768px) {
    width: 95px;
  }
`;

export const CardImage = styled.img`
  width: 307px;
  border-radius: 10px;
  filter: drop-shadow(0 0 3px #060e18);
  outline: #0c0c0c solid 1px;
  transform: translateY(2px);
`;

const InfoSpan = styled.span`
  width: 100%;
  display: flex;
  justify-content: space-evenly;
  font-family: Cuisine, sans-serif;
  font-size: 24px;

  a {
    color: ghostwhite;

    &:hover {
      color: dodgerblue;
    }
  }
`;

const TrashPlaceholder = styled.div`
  width: 105px;
  height: 146px;
  border-radius: 5px;
  border: #0c0c0c solid 2px;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const BackGround = styled.div`
  display: flex;
  z-index: -10;
  justify-content: center;
  align-items: center;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(253deg, #193131, #092d4b, #4a1f64);
  background-size: 300% 300%;
  -webkit-animation: Background 25s ease infinite;
  -moz-animation: Background 25s ease infinite;
  animation: Background 25s ease infinite;

  @-webkit-keyframes Background {
    0% {
      background-position: 0% 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0% 50%
    }
  }

  @-moz-keyframes Background {
    0% {
      background-position: 0% 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0% 50%
    }
  }

  @keyframes Background {
    0% {
      background-position: 0% 50%
    }
    50% {
      background-position: 100% 50%
    }
    100% {
      background-position: 0% 50%
    }
`;

const BackGroundPattern = styled.div`
  position: fixed;
  top: -50vh;
  left: -50vw;
  width: 200vw;
  height: 200vh;
  background: transparent url('http://assets.iceable.com/img/noise-transparent.png') repeat 0 0;
  background-repeat: repeat;
  animation: bg-animation .2s infinite;
  opacity: .4;
  z-index: 0;
  @keyframes bg-animation {
    0% {
      transform: translate(0, 0)
    }
    10% {
      transform: translate(-1%, -1%)
    }
    20% {
      transform: translate(-2%, 1%)
    }
    30% {
      transform: translate(1%, -2%)
    }
    40% {
      transform: translate(-1%, 3%)
    }
    50% {
      transform: translate(-2%, 1%)
    }
    60% {
      transform: translate(3%, 0)
    }
    70% {
      transform: translate(0, 2%)
    }
    80% {
      transform: translate(-3%, 0)
    }
    90% {
      transform: translate(2%, 1%)
    }
    100% {
      transform: translate(1%, 0)
    }
  }
`;