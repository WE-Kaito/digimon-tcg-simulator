import styled from "@emotion/styled";
import { SIDE } from "../../utils/types.ts";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { profilePicture } from "../../utils/avatars.ts";
import { WSUtils } from "../../pages/GamePage.tsx";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";

type Props = { side: SIDE; wsUtils?: WSUtils };

export default function PlayerCard({ side, wsUtils }: Props) {
    const username = useGeneralStates((state) => state.user);
    const player1 = useGameBoardStates((state) => state.player1);
    const player2 = useGameBoardStates((state) => state.player2);
    const myAvatar = player1.username === username ? player1.avatarName : player2.avatarName;
    const opponentAvatar = player1.username === username ? player2.avatarName : player1.avatarName;
    const avatarWidth = useGeneralStates((state) => state.cardWidth / 1.5);
    const avatar = side === SIDE.MY ? myAvatar : opponentAvatar;

    return (
        <Container>
            <StyledImg src={profilePicture(avatar)} alt={"ava"} width={avatarWidth} side={side} />
            <StyledSpan side={side} avatarWidth={avatarWidth}>
                {side === SIDE.MY ? wsUtils?.matchInfo.user : wsUtils?.matchInfo.opponentName}
            </StyledSpan>
        </Container>
    );
}

const Container = styled.div`
    grid-area: player;
    //transform: translateX(-2%);
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    height: 100%;
`;

const StyledImg = styled.img<{ side: SIDE; width: number }>`
    //transform: translateZ(180px);
    position: absolute;
    left: 5px;
    top: ${({ width, side }) => (side === SIDE.MY ? `${-width / 3.5}px` : "unset")};
    aspect-ratio: 1;
    filter: drop-shadow(0 0 1px rgba(255, 255, 255, 0.1));
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    pointer-events: none;
`;

const StyledSpan = styled.span<{ side: SIDE; avatarWidth: number }>`
    width: calc(92.5% - ${({ avatarWidth }) => avatarWidth}px);
    font-family: Frutiger, sans-serif;
    font-weight: bold;
    font-size: ${({ avatarWidth }) => avatarWidth / 2.5}px;
    text-align: start;
    color: ghostwhite;
    opacity: 0.7;
    letter-spacing: 1px;
    line-height: 1;
    filter: drop-shadow(0 0 2px rgba(0, 0, 0, 0.9));
    align-self: center;
    transform: ${({ side }) => (side === SIDE.MY ? "translateY(-30%)" : "unset")};
`;
