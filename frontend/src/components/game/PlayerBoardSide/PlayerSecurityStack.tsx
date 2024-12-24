import {Tooltip, Zoom as MuiZoom} from "@mui/material";
import Card from "../../Card.tsx";
import {getSleeve} from "../../../utils/sleeves.ts";
import mySecurityAnimation from "../../../assets/lotties/my-security-apng.png";
import {Fragment, useEffect, useState} from "react";
import styled from "@emotion/styled";
import {useGameBoardStates} from "../../../hooks/useGameBoardStates.ts";
import {useContextMenu} from "react-contexify";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {BootStage} from "../../../utils/types.ts";
import {useSound} from "../../../hooks/useSound.ts";
import useResponsiveFontSize from "../../../hooks/useResponsiveFontSize.ts";
import {WSUtils} from "../../../pages/GamePage.tsx";
import {useDndContext} from "@dnd-kit/core";
import {useLongPress} from "../../../hooks/useLongPress.ts";

export default function PlayerSecurityStack({wsUtils}: { wsUtils?: WSUtils }) {
    const mySleeve = useGameBoardStates((state) => state.mySleeve);
    const mySecurity = useGameBoardStates((state) => state.mySecurity);
    const opponentReveal = useGameBoardStates((state) => state.opponentReveal);
    const moveCard = useGameBoardStates((state) => state.moveCard);
    const bootStage = useGameBoardStates((state) => state.bootStage);
    const getOpponentReady = useGameBoardStates((state) => state.getOpponentReady);

    const playSecurityRevealSfx = useSound((state) => state.playSecurityRevealSfx);

    const isDisabled = bootStage !== BootStage.GAME_IN_PROGRESS || !getOpponentReady();

    function sendSecurityReveal() {
        if (opponentReveal.length) return;
        moveCard(mySecurity[0].id, "mySecurity", "myReveal");
        playSecurityRevealSfx();
        wsUtils?.sendMoveCard(mySecurity[0].id, "mySecurity", "myReveal");
        wsUtils?.sendSfx("playSecurityRevealSfx");
        wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【${mySecurity[0].name}】﹕Security ➟ Reveal`);
    }

    const {fontContainerRef, fontSize} = useResponsiveFontSize(2, 55);

    const [isOpen, setIsOpen] = useState(false);

    const {show: showSecurityStackMenu} = useContextMenu({id: "securityStackMenu"});

    const {active} = useDndContext();
    const isDraggingFromSecurity = String(active?.id)?.includes("mySecurity");

    useEffect(() => {
        if(!isDraggingFromSecurity) setIsOpen(false); // prevents being stuck in open state after drop
    }, [isDraggingFromSecurity]);

    function onLongPress(event: React.TouchEvent<HTMLImageElement>) {
        if (!isDisabled) showSecurityStackMenu({event})
    }

    const { handleTouchStart, handleTouchEnd } = useLongPress({onLongPress});

    return (
        <Container ref={fontContainerRef}>
            <Tooltip TransitionComponent={MuiZoom} sx={{width: "100%"}}
                     open={(mySecurity.length === 0 ? false : isOpen)}
                     onClose={() => setIsOpen(isDraggingFromSecurity)}
                     onOpen={() => setIsOpen(!!mySecurity.length)}
                     arrow placement={"top"}
                     componentsProps={getTooltipStyles(mySecurity.length)}
                     title={
                            <div style={{position: "relative", display: "flex", flexWrap: "wrap", gap: "5px"}}>
                                {mySecurity.map((card, index) =>
                                        <Fragment key={card.id + "_fragment"}>
                                            {index === 0 &&
                                                <ArrowDropUpIcon key={card.id + "_arrow"} sx={{
                                                    position: "absolute",
                                                    zIndex: 5,
                                                    fontSize: 35,
                                                    color: "#3787ff",
                                                    left: 9,
                                                    top: -21,
                                                    filter: "dropShadow(0 0 2px black)"
                                                }}/>
                                            }
                                            {card.inSecurityFaceUp
                                                ? <Card key={card.id} card={card} location={"mySecurity"} style={{ width: "50px"}}/>
                                                : <FaceDownCard key={card.id} alt="card" src={getSleeve(mySleeve)}/>
                                            }
                                        </Fragment>
                                )}
                            </div>}
            >
                <SecuritySpan onContextMenu={(e) => !isDisabled && showSecurityStackMenu({event: e})}
                              id={"mySecurity"}
                              style={{fontSize, cursor: isDisabled ? "not-allowed" : "pointer"}}
                              onClick={() => !isDisabled && sendSecurityReveal()}
                              onTouchStart={handleTouchStart}
                              onTouchEnd={handleTouchEnd}
                              className={"prevent-default-long-press"}
                >
                    {mySecurity.length}
                </SecuritySpan>
            </Tooltip>
            <SecurityAnimationImg alt={"mySS"} src={mySecurityAnimation} className={"prevent-default-long-press"}/>
        </Container>
    );
}

const Container = styled.div`
  grid-area: SS;
  height: 100%;
  width: 100%;
  z-index: 10;
  transform: translateY(-10%);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SecuritySpan = styled.span`
  z-index: 5;
  font-family: Awsumsans, sans-serif;
  font-style: normal;
  font-size: 2em;
  text-shadow: #111921 1px 1px 1px;
  cursor: pointer;
  color: #5ba2cb;
  transition: all 0.15s ease;

  &:hover {
    filter: drop-shadow(0 0 5px #1b82e8) saturate(1.5);
    scale: 1.1;
    color: #f9f9f9;
  }
  @media (max-height: 500px) {
    font-size: 1.5em;
  }
`;

const SecurityAnimationImg = styled.img`
  width: 200%;
  position: absolute;
  left: 50%;
  top: 47%;
  transform: translate(-50%, -50%);
`;

export const FaceDownCard = styled.img`
  width: 50px;
  max-width: 50px;
  max-height: 70px;
  border-radius: 2px;

  @media (max-width: 767px) {
    max-height: 115px;
  }
  @media (min-width: 768px) {
    width: 95px;
  }
`;

function getTooltipStyles(stackLength: number) {
    return {
        tooltip: {
            style: {
                backgroundColor: "#0c0c0c",
                borderRadius: 6,
                boxShadow: "inset 0 0 0 2px #2e74f6",
                filter: "drop-shadow(1px 2px 3px black)",
                padding: 10,
                minWidth: 280,
                maxWidth: `${stackLength <= 10 ? stackLength * 55 + 30 : 580}px`,
            },
        },
        arrow: {
            style: {color: "#2e74f6"},

        },
    };
}
