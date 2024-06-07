import {Stack, Tooltip, Zoom as MuiZoom} from "@mui/material";
import Card from "../Card.tsx";
import {getSleeve} from "../../utils/sleeves.ts";
import mySecurityAnimation from "../../assets/lotties/mySecurity.json";
import opponentSecurityAnimation from "../../assets/lotties/opponentSecurity.json";
import {Fragment, useState} from "react";
import styled from "@emotion/styled";
import Lottie from "lottie-react";
import {useGame} from "../../hooks/useGame.ts";
import {useContextMenu} from "react-contexify";
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

type SecurityStackProps = {
    isOpponent?: boolean;
    sendSecurityReveal?: () => void;
}

export default function SecurityStack({isOpponent = false, sendSecurityReveal}: SecurityStackProps) {
    const mySleeve = useGame((state) => state.mySleeve);
    const opponentSleeve = useGame((state) => state.opponentSleeve);
    const mySecurity = useGame((state) => state.mySecurity);
    const opponentSecurity = useGame((state) => state.opponentSecurity);

    const [isOpen, setIsOpen] = useState(false);

    const cards = isOpponent ? opponentSecurity : mySecurity;

    const SpanComponent = isOpponent ? OpponentSecuritySpan : MySecuritySpan;

    const {show: showSecurityStackMenu} = useContextMenu({id: "securityStackMenu"});

    return (
        <StyledDiv isOpponent={isOpponent}>
            <Tooltip TransitionComponent={MuiZoom} sx={{width: "100%"}}
                     open={cards.length === 0 ? false : isOpen}
                     onClose={() => setIsOpen(false)}
                     onOpen={() => setIsOpen(!!cards.length)}
                     arrow placement={isOpponent ? "bottom" : "top"}
                     componentsProps={getTooltipStyles(cards.length, isOpponent)}
                     title={
                         <Stack direction={"row"} gap={1} flexWrap={"wrap"} sx={{position: "relative"}}>
                             {cards.map((card, index) =>
                                 <Fragment key={card.id + "_fragment"}>
                                     {index === 0 &&
                                         <ArrowDropUpIcon key={card.id + "_arrow"} sx={{ position: "absolute", zIndex: 5,
                                             fontSize: 35, color: isOpponent ? "#d52563" : "#3787ff", left: 9, top: -21,
                                             filter: "dropShadow(0 0 2px black)"}}/>
                                     }
                                     {card.inSecurityFaceUp
                                         ? <Card key={card.id} card={card} location={isOpponent ? "opponentSecurityTooltip" : "mySecurityTooltip"}/>
                                         : <FaceDownCard key={card.id} alt="card"
                                                         src={getSleeve(isOpponent ? opponentSleeve : mySleeve)}/>
                                     }
                                 </Fragment>
                             )}
                         </Stack>
                     }>
                <SpanComponent onContextMenu={(e) => !isOpponent && showSecurityStackMenu({event: e})}
                               id={isOpponent ? "opponentSecurity" : "mySecurity"}
                               onClick={() => sendSecurityReveal?.()}
                    >
                    {cards.length}
                </SpanComponent>
            </Tooltip>
            <SecurityStackLottie animationData={isOpponent ? opponentSecurityAnimation : mySecurityAnimation}
                                 loop={true} onContextMenu={(e) => showSecurityStackMenu({event: e})}/>
        </StyledDiv>
    );
}

function getTooltipStyles(stackLength: number, isOpponent: boolean) {
    return {
        tooltip: {
            style: {
                backgroundColor: "#0c0c0c",
                borderRadius: 6,
                boxShadow: `inset 0 0 0 2px ${isOpponent ? "#961626" : "#2e74f6"}`,
                filter: "drop-shadow(1px 2px 3px black)",
                padding: 10,
                minWidth: 280,
                maxWidth: `${stackLength <= 10 ? stackLength * 55 + 30 : 580}px`,
            },
        },
        arrow: {
            style: { color: isOpponent ? "#961626" : "#2e74f6" },

        },
    };
}

const OpponentSecuritySpan = styled.span`
  position: absolute;
  z-index: 5;
  font-family: Awsumsans, sans-serif;
  font-style: normal;
  font-size: 35px;
  text-shadow: #111921 1px 1px 1px;
  color: #cb6377;
  user-select: none;
  transform: translate(-49.5%, 50%);
  left: 50%;
  bottom: 50%;
  cursor: help;
`;

const MySecuritySpan = styled(OpponentSecuritySpan)`
  cursor: pointer;
  color: #5ba2cb;
  transition: all 0.15s ease;
  transform: translate(49.5%, -50%);
  left: unset;
  right: 50%;
  bottom: unset;
  top: 50%;
  &:hover {
    filter: drop-shadow(0 0 5px #1b82e8) saturate(1.5);
    font-size: 42px;
    color: #f9f9f9;
  }
`;

const SecurityStackLottie = styled(Lottie)`
  width: 160px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;

export const FaceDownCard = styled.img`
  width: 69.5px;
  max-width: 50px;
  max-height: 70px;
  border-radius: 5px;

  @media (max-width: 767px) {
    max-height: 115px;
  }

  @media (min-width: 768px) {
    width: 95px;
  }
`;

const StyledDiv = styled.div<{isOpponent: boolean}>`
  position: absolute;
  width: 160px;
  height: 160px;
  
  right: ${({isOpponent}) => isOpponent ? "unset" : "7px"};
  top: ${({isOpponent}) => isOpponent ? "unset" : "-32px"};
  left: ${({isOpponent}) => isOpponent ? "7px" : "unset"};
  bottom: ${({isOpponent}) => isOpponent ? "-32px" : "unset"};
`;
