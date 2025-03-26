import styled from "@emotion/styled";
import { SIDE } from "../../utils/types.ts";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { profilePicture } from "../../utils/avatars.ts";
import { WSUtils } from "../../pages/GamePage.tsx";

type Props = { side: SIDE; wsUtils?: WSUtils };

export default function PlayerCard({ side, wsUtils }: Props) {
    const avatar = useGameBoardStates((state) => (side === SIDE.MY ? state.myAvatar : state.opponentAvatar));
    return (
        <Container>
            {wsUtils && side === SIDE.MY && (
                <StyledSpan style={{ transform: "translateY(-30%)" }}>{wsUtils.matchInfo.user}</StyledSpan>
            )}
            <StyledImg src={profilePicture(avatar)} alt={"ava"} />
            {wsUtils && side === SIDE.OPPONENT && (
                <StyledSpan style={{ transform: "translateY(20%)" }}>{wsUtils.matchInfo.opponentName}</StyledSpan>
            )}
        </Container>
    );
}

const Container = styled.div`
    grid-area: player;
    transform: translateX(-2%);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
`;

const StyledImg = styled.img`
    transform: translateZ(180);
    height: 100%;
    max-height: 85%;
    filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.1));
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    pointer-events: none;
`;

const StyledSpan = styled.span`
    font-family: Frutiger, sans-serif;
    font-weight: bold;
    font-size: 1.2em;
    color: ghostwhite;
    opacity: 0.7;
    letter-spacing: 1px;
    line-height: 1;
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.9));
    align-self: flex-end;
`;

const Card = styled.div`
    grid-area: player;
    height: 95%;
    width: 95%;
    margin: 1%;
    padding: 1.5%;
    transform: translateX(-2%);
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    align-items: center;
    border-radius: 5px;
    background: linear-gradient(
        20deg,
        rgba(54, 93, 131, 0.32) 0%,
        rgba(48, 78, 112, 0.32) 70%,
        rgba(24, 46, 61, 0.32) 100%
    );
    box-shadow: inset 2px 3px 10px 3px rgba(71, 161, 196, 0.25);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.9));

    &&:before {
        content: "";
        position: absolute;
        top: 2.5%;
        left: 2.5%;
        width: 95%;
        height: 95%;
        border-radius: 5px;
        background: linear-gradient(20deg, rgb(24, 24, 24) 0%, rgb(10, 10, 10) 70%, rgb(0, 0, 0) 100%);
        z-index: -1;
        box-shadow: inset 0 0 3px 1px rgba(146, 255, 245, 0.15);
    }
`;
