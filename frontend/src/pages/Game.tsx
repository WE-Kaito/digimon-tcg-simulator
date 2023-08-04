import {useStore} from "../hooks/useStore.ts";
import useWebSocket from "react-use-websocket";
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {CardType} from "../utils/types.ts";

export default function Game({user}: { user: string }) {

    const gameId = useStore((state) => state.gameId);
    const navigate = useNavigate();

    const [players, setPlayers] = useState([]);
    const [myCards, setMyCards] = useState<any>([]);

    type Player = {
        username: string,
        avatarName: string,
        deck: CardType[]

    }

    const websocket = useWebSocket("ws://localhost:8080/api/ws/game", {
        onOpen: () => {
            websocket.sendMessage("/startGame:" + gameId);
        },
        onMessage: (event) => {
            if (event.data.startsWith("[START_GAME]:")) {
                const playersJson = event.data.substring("[START_GAME]:".length);
                const players = JSON.parse(playersJson);
                console.log("Players: ", players);
                setPlayers(players);

                const me = players.filter((player: Player) => player.username === user)[0];
                setMyCards(me.deck);
                console.log("My cards: ", me.deck);
            }
            else{
                console.log("Received message: " + event.data);
            }
        }
    });

    function handleClick(){
    websocket.sendMessage(`${gameId}:Hello`);
    }

    return (
        <>
        <h1>Spielbrett</h1>
            <button onClick={handleClick}>TESTBUTTON</button>
            {myCards.map((card:any, index) => {
                return <p key={index}>{card.name}</p>
                }
            )}
        </>
    );
}

