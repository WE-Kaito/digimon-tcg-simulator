import { WSUtils } from "../../../pages/GamePage.tsx";
import { useGameBoardStates } from "../../../hooks/useGameBoardStates.ts";
import { useSound } from "../../../hooks/useSound.ts";
import { CardType, SIDE } from "../../../utils/types.ts";
import { uid } from "uid";
import { tokenCollection } from "../../../utils/tokens.ts";
import { useGeneralStates } from "../../../hooks/useGeneralStates.ts";
import { useGameUIStates } from "../../../hooks/useGameUIStates.ts";
import styled from "@emotion/styled";
import { generateUUID } from "../../../utils/generateUUID.ts";

export default function TokenModal({ wsUtils }: { wsUtils?: WSUtils }) {
    const setHoverCard = useGeneralStates((state) => state.setHoverCard);
    const isTokenDialogOpen = useGameUIStates((state) => state.isTokenDialogOpen);
    const setIsTokenDialogOpen = useGameUIStates((state) => state.setIsTokenDialogOpen);
    const createToken = useGameBoardStates((state) => state.createToken);

    const playPlaceCardSfx = useSound((state) => state.playPlaceCardSfx);

    function handleCreateToken(token: CardType) {
        const id = generateUUID();
        const placementPosition = createToken(token, SIDE.MY, id);
        playPlaceCardSfx();

        // Create CardTypeGame object to send to backend
        const tokenGame = {
            ...token,
            id: id,
            isTilted: false,
            isFaceUp: true,
            modifiers: { plusDp: 0, plusSecurityAttacks: 0, keywords: [], colors: token.color },
        };
        const cardJson = JSON.stringify(tokenGame);

        wsUtils?.sendMessage(`${wsUtils.matchInfo.gameId}:/createToken:${placementPosition}:${cardJson}`);
        wsUtils?.sendSfx("playPlaceCardSfx");
        wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【Spawn ${token.name}-Token】`);
        setIsTokenDialogOpen(false);
    }

    const onHover = (token: CardType) => setHoverCard({ ...token, id: uid() });

    if (!isTokenDialogOpen) return <></>;

    return (
        <Container>
            <StyledSpan>Choose a token to place:</StyledSpan>
            <ButtonContainer>
                {tokenCollection.map((token) => (
                    <StyledButton
                        key={token.name}
                        onClick={() => handleCreateToken(token)}
                        onMouseOver={() => onHover(token)}
                    >
                        {token.name}
                    </StyledButton>
                ))}
                <StyledCancelButton onClick={() => setIsTokenDialogOpen(false)}>CANCEL</StyledCancelButton>
            </ButtonContainer>
        </Container>
    );
}

const StyledSpan = styled.span`
    font-family:
        Pixel Digivolve,
        sans-serif;
    font-size: 22px;
    text-shadow: black 2px 4px 2px;
`;

const Container = styled.div`
    z-index: 10000;
    position: absolute;
    width: fit-content;
    max-width: 1000px;
    height: fit-content;
    padding: 3vh 2.5vw 5vh 2.5vw;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 30px;
    background: #0c0c0c;
    transition: all 0.2s ease;
    border-radius: 25px;

    left: 53.5%;
    top: 50%;
    transform: translate(-50%, -50%);
`;

const ButtonContainer = styled.div`
    width: 100%;
    display: flex;
    gap: 20px;
    justify-content: space-evenly;
    flex-wrap: wrap;
`;

const StyledButton = styled.button`
    cursor: pointer;
    width: fit-content;
    border-radius: 5px;
    background-image:
        repeating-linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 6%,
            rgba(255, 255, 255, 0.1) 7.5%
        ),
        repeating-linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 4%, rgba(0, 0, 0, 0.03) 4.5%),
        repeating-linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 1.2%,
            rgba(255, 255, 255, 0.15) 2.2%
        ),
        linear-gradient(
            180deg,
            rgb(212, 175, 55) 0%,
            rgb(255, 215, 0) 47%,
            rgb(212, 175, 55) 53%,
            rgb(184, 134, 11) 100%
        );
    font-family: "League Spartan", sans-serif;
    font-size: 18px;
    font-weight: bolder;
    padding: 6px;
    color: #0c0c0c;
    box-shadow: 6px 12px 1px 0 rgb(0, 0, 0);
    transition: all 0.15s ease;

    &:hover {
        transform: translateY(1px);
        filter: contrast(1.15) saturate(1.25);
        box-shadow: 4px 8px 1px 0 rgba(0, 0, 0, 0.9);
    }

    &:focus {
        outline: none;
    }

    &:active {
        transform: translateY(2px);
        filter: contrast(1.3) saturate(1.25);
        box-shadow: 2px 4px 1px 0 rgba(0, 0, 0, 0.8);
    }
`;

const StyledCancelButton = styled(StyledButton)`
    background-image:
        repeating-linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 6%,
            rgba(255, 255, 255, 0.1) 7.5%
        ),
        repeating-linear-gradient(to right, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 4%, rgba(0, 0, 0, 0.03) 4.5%),
        repeating-linear-gradient(
            to right,
            rgba(255, 255, 255, 0) 0%,
            rgba(255, 255, 255, 0) 1.2%,
            rgba(255, 255, 255, 0.15) 2.2%
        ),
        linear-gradient(
            180deg,
            rgb(199, 199, 199) 0%,
            rgb(230, 230, 230) 47%,
            rgb(199, 199, 199) 53%,
            rgb(179, 179, 179) 100%
        );
`;
