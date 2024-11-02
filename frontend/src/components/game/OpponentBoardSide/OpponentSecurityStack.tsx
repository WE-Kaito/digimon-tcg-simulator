import {Tooltip, Zoom as MuiZoom} from "@mui/material";
import Card from "../../Card.tsx";
import {getSleeve} from "../../../utils/sleeves.ts";
import opponentSecurityAnimation from "../../../assets/lotties/opponent-security-apng.png";
import swordAnimation from "../../../assets/lotties/sword.json";
import {Fragment, useState} from "react";
import styled from "@emotion/styled";
import Lottie from "lottie-react";
import {useGameBoardStates} from "../../../hooks/useGameBoardStates.ts";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import {useDroppable} from "@dnd-kit/core";
import useResponsiveFontSize from "../../../hooks/useResponsiveFontSize.ts";

export default function OpponentSecurityStack() {
    const [opponentSecurity, opponentSleeve] = useGameBoardStates((state) => [state.opponentSecurity, state.opponentSleeve]);

    const {setNodeRef, isOver, active} = useDroppable({ id: "opponentSecurity", data: { accept: ["card"] } });
    const isOverOpponent = isOver && String(active?.id).includes("myDigi");

    const [isOpen, setIsOpen] = useState(false);

    const {fontContainerRef, fontSize} = useResponsiveFontSize(2, 55);

    return (
        <Container ref={fontContainerRef}>
            <InnerContainer ref={setNodeRef}>
                {isOverOpponent
                    ? <Lottie animationData={swordAnimation} loop style={{zIndex: 100000}}/>
                    : <Tooltip TransitionComponent={MuiZoom} sx={{width: "100%"}}
                               open={opponentSecurity.length === 0 ? false : isOpen}
                               onClose={() => setIsOpen(false)}
                               onOpen={() => setIsOpen(!!opponentSecurity.length)}
                               arrow placement={"bottom"}
                               componentsProps={getTooltipStyles(opponentSecurity.length)}
                               title={
                                   <div style={{position: "relative", display: "flex", flexWrap: "wrap", gap: "5px"}}>
                                       {opponentSecurity.map((card, index) =>
                                           <Fragment key={card.id + "_fragment"}>
                                               {index === 0 &&
                                                   <ArrowDropUpIcon key={card.id + "_arrow"} sx={{
                                                       position: "absolute",
                                                       zIndex: 5,
                                                       fontSize: 35,
                                                       color: "#d52563",
                                                       left: 9,
                                                       top: -21,
                                                       filter: "dropShadow(0 0 2px black)"
                                                   }}/>
                                               }
                                               {card.inSecurityFaceUp
                                                   ? <Card key={card.id} card={card} location={"opponentSecurity"} style={{ width: "50px"}} />
                                                   : <FaceDownCard key={card.id} alt="card" src={getSleeve(opponentSleeve)}/>
                                               }
                                           </Fragment>
                                       )}
                                   </div>}>
                        <OpponentSecuritySpan id={"opponentSecurity"} style={{fontSize}}>
                            {opponentSecurity.length}
                        </OpponentSecuritySpan>
                    </Tooltip>}
                <SecurityAnimationImg alt={"oppSS"} src={opponentSecurityAnimation} />
            </InnerContainer>
        </Container>
    );
}

const Container = styled.div`
  grid-area: SS;
  height: 100%;
  width: 100%;
  z-index: 10;
  transform: translateY(10%);
`;

const InnerContainer = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const OpponentSecuritySpan = styled.span`
  z-index: 5;
  font-family: Awsumsans, sans-serif;
  font-style: normal;
  font-size: 2em;
  text-shadow: #111921 1px 1px 1px;
  color: #cb6377;
  user-select: none;
  cursor: help;
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
  width: 69.5px;
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
                boxShadow: "inset 0 0 0 2px #961626",
                filter: "drop-shadow(1px 2px 3px black)",
                padding: 10,
                minWidth: 280,
                maxWidth: `${stackLength <= 10 ? stackLength * 55 + 30 : 580}px`,
            },
        },
        arrow: {
            style: { color: "#961626" },

        },
    };
}
