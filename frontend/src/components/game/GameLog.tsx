import {useGameBoardStates} from "../../hooks/useGameBoardStates.ts";
import styled from "@emotion/styled";
import {uid} from "uid";
import {WSUtils} from "../../pages/GamePage.tsx";

export default function GameLog({ matchInfo }: Pick<WSUtils, "matchInfo">) {

    const messages = useGameBoardStates(state => state.messages);

    return (
        <History>
            {messages.map((message) => {
                if (message.startsWith("[STARTING_PLAYER]≔")) {
                    const startingPlayer = message.split("≔")[1];
                    return (
                        <StartingPlayerMessage key={uid()}>
                            <p>Starting Player: {startingPlayer}</p>
                        </StartingPlayerMessage>
                    );
                }

                const userName = message.split("﹕", 2)[0];
                const chatMessage = message.split("﹕", 2)[1];
                const isMyMessage = userName === matchInfo.user;

                if (chatMessage.startsWith("[FIELD_UPDATE]≔")){
                    const startIndex = message.indexOf("【");
                    const filteredMessage = message.substring(startIndex);
                    const cardName = filteredMessage.split("﹕")[0];
                    const cardLocation = filteredMessage.split("﹕")[1];
                    if (filteredMessage.startsWith("【MEMORY】")){
                        const oldMemory = parseInt(cardLocation.split("±")[0]);
                        const newMemory = parseInt(cardLocation.split("±")[1]);
                        return (
                            <UpdateMessage isMyMessage={isMyMessage} key={uid()}>
                                <p>
                                    {cardName} {isMyMessage
                                    ?`${oldMemory.toString()} ➟ ${newMemory.toString()}`
                                    :`${(-oldMemory).toString()} ➟ ${(-newMemory).toString()}`}
                                </p>
                            </UpdateMessage>
                        );
                    }
                    return (
                        <UpdateMessage isMyMessage={isMyMessage} key={uid()}>
                            <p>{cardName} {cardLocation}</p>
                        </UpdateMessage>
                    );
                }

                return <></>;
            })}
        </History>
    );
}

const UpdateMessage = styled.div<{isMyMessage:boolean}>`
  display: flex;
  width: 80%;
  height: fit-content;
  align-self: ${({isMyMessage}) => isMyMessage ? "flex-end" : "flex-start"};
  background: ${({isMyMessage}) => isMyMessage ? "rgba(84, 84, 84, 0.15)" : "rgba(37,66,93,0.35)"};
  padding: 1px 4px 0 4px;
  
  p {
    font-family: Cousine, sans-serif;
    color: papayawhip;
    margin: 3px;
    width: 100%;
    max-width: 100%;
    text-align: left;
    opacity: ${({isMyMessage}) => isMyMessage ? "0.6" : "0.8"};
  }
`;

const StartingPlayerMessage = styled.div`
  width: 98%;
  height: fit-content;
  background: rgba(231, 202, 12, 0.65);
  border-radius: 5px;
  padding: 1px 4px 0 4px;
  display: flex;

  p {
    text-wrap: normal;
    margin: 2px;
    font-family: Cousine, sans-serif;
    width: 100%;
    text-align: center;
    color: #060e18;
    max-width: 100%;
    text-shadow: 0 0 1px #060e18;
  }
`;

const History = styled.div`
  display: flex;
  flex-direction: column-reverse;
  align-items: flex-start;
  justify-content: flex-start;
  height: 100%;
  width: 98%;
  padding: 0 1% 0 1%;
  overflow-y: scroll;
  overflow-x: hidden;
  gap: 3px;
  z-index: 100;

  @supports (-moz-appearance:none) {
    scrollbar-width: thin;
  }
  
  ::-webkit-scrollbar {
    background: rgba(30, 31, 16, 0.5);
    width: 8px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(255, 239, 213, 0.75);
  }
`;
