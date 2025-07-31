import { CardTypeGame, SIDE } from "../../utils/types.ts";
import { WSUtils } from "../../pages/GamePage.tsx";
// import { useDroppable } from "@dnd-kit/core";
import { useDroppableReactDnd } from "../../hooks/useDroppableReactDnd.ts";
import { useGameUIStates } from "../../hooks/useGameUIStates.ts";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import { useContextMenu } from "react-contexify";
import CardStack from "./CardStack.tsx";
import styled from "@emotion/styled";
import CloseDetailsIcon from "@mui/icons-material/SearchOffRounded";

type LinkAreaProps = {
    side: SIDE;
    wsUtils?: WSUtils;
    num: number;
};

export default function LinkArea(props: LinkAreaProps) {
    const { num, side, wsUtils } = props;
    const fieldOffset = useGameUIStates((state) => state.fieldOffset);
    const opponentFieldOffset = useGameUIStates((state) => state.opponentFieldOffset);
    
    // Use the appropriate offset based on which side this is
    const currentOffset = side === SIDE.MY ? fieldOffset : opponentFieldOffset;
    
    // Calculate actual link number based on position and offset
    const actualLinkNum = num <= 8 ? num + currentOffset : num + 8; // LA9-13 become Link17-21
    const location = `${side}Link${actualLinkNum}`;

    const { setNodeRef: dropToField, isOver: isOverField } = useDroppableReactDnd({
        id: location,
        data: { accept: side === SIDE.MY ? ["card"] : [] },
    });

    const stackModal = useGameUIStates((state) => state.stackModal);
    const setStackModal = useGameUIStates((state) => state.setStackModal);
    const locationCards = useGameBoardStates((state) => state[location as keyof typeof state] as CardTypeGame[]);

    // const showLinkIcon = side === SIDE.MY && !locationCards.length && isSingleCard;
    const stackOpened = stackModal === location;

    const { show: showLinkFieldCardMenu } = useContextMenu({
        id: "fieldCardMenu",
        props: { index: -1, location: "", id: "" },
    });
    const { show: showOpponentCardMenu } = useContextMenu({
        id: "opponentCardMenu",
        props: { index: -1, location: "", id: "" },
    });

    return (
        <Container
            {...props}
            // id is set for correct AttackArrow targeting. In case there is no card the field itself is the target.
            id={locationCards.length ? "" : location}
            ref={dropToField as any}
            isOver={side === SIDE.MY && isOverField}
            stackOpened={stackOpened}
            onClick={() => stackOpened && setStackModal(false)}
            className={stackOpened ? "button" : undefined}
        >
            <div style={{ position: "relative", height: "100%", width: "100%" }}>
                {/*{showLinkIcon && <StyledLinkIcon />}*/}
                {stackOpened && <StyledCloseDetailsIcon />}
                {!!locationCards.length && !stackOpened && (
                    <CardStack
                        cards={locationCards}
                        location={location}
                        opponentSide={side === SIDE.OPPONENT}
                        wsUtils={wsUtils}
                        showFieldCardMenu={showLinkFieldCardMenu}
                        showOpponentCardMenu={showOpponentCardMenu}
                    />
                )}
            </div>
        </Container>
    );
}

const Container = styled.div<LinkAreaProps & { isOver: boolean; stackOpened: boolean }>`
    //touch-action: none;
    cursor: ${({ stackOpened }) => (stackOpened ? "pointer" : "unset")};
    grid-area: ${(props) => `LA${props.num}`};
    height: calc(100% - 6px);
    width: calc(100% - 6px);
    border-radius: ${({ side }) => (side === SIDE.MY ? "0 5px 5px 0" : "5px 0 0 5px")};
    display: flex;
    justify-content: center;
    align-items: center;
    background: ${({ isOver, stackOpened }) =>
        isOver
            ? "linear-gradient(to top, rgba(222, 222, 222, 0.35) 0%, transparent 95%)"
            : stackOpened
              ? "rgba(239,176,68,0.75)"
              : "rgba(20, 20, 20, 0.25)"};
    box-shadow: inset ${({ side }) => (side === SIDE.MY ? "10px" : "-10px")} 0 20px rgba(113, 175, 201, 0.1);
    transform: translateX(${({ side }) => (side === SIDE.MY ? "-6px" : "6px")});
`;
//
// const StyledLinkIcon = styled(AddLinkIcon)`
//     position: absolute;
//     top: 50%;
//     left: 50%;
//     transform: translate(-50%, -50%);
//     opacity: 0.75;
//     font-size: 1em;
// `;

const StyledCloseDetailsIcon = styled(CloseDetailsIcon)`
    color: black;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    opacity: 0.5;
    font-size: 1.5em;
`;
