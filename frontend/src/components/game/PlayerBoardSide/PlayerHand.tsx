import {getSleeve} from "../../../utils/sleeves.ts";
import Card from "../../Card.tsx";
import {Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon} from "@mui/icons-material";
import styled from "@emotion/styled";
import {useGame} from "../../../hooks/useGame.ts";
import {useContextMenu} from "react-contexify";
import {useEffect, useRef, useState} from "react";
import {calculateCardOffsetX, calculateCardOffsetY, calculateCardRotation } from "../../../utils/functions.ts";

export default function PlayerHand() {
    const {show: showHandCardMenu} = useContextMenu({id: "handCardMenu", props: {index: -1}});

    const [isHandHidden, setIsHandHidden] = useState<boolean>(true);
    const myHand = useGame((state) => state.myHand);
    const mySleeve = useGame((state) => state.mySleeve);

    const containerRef = useRef<HTMLDivElement>(null);
    const [cardWidth, setCardWidth] = useState(70);

    const calculateCardWidth = () => setCardWidth(containerRef.current ? containerRef.current.clientWidth / 5.5 : 70);

    useEffect(() => {
        calculateCardWidth();
        window.addEventListener('resize', calculateCardWidth);
        return () => window.removeEventListener('resize', calculateCardWidth);
    }, []);

    // replace with ref dropToHand later
    return (
        <Container ref={containerRef}>
            <StyledList cardCount={myHand.length}
                       style={{transform: `translateX(-${myHand.length > 12 ? (myHand.length * 0.5) : 0}px)`}}>
                {myHand.map((card, index) =>
                    <ListItem cardCount={myHand.length} cardIndex={index} cardWidth={cardWidth} key={card.id}
                                  onContextMenu={(e) => showHandCardMenu({
                                      event: e,
                                      props: {index}
                                  })}>
                        {isHandHidden
                            ? <FaceDownCard alt="card" src={getSleeve(mySleeve)} style={{ width: cardWidth }}/>
                            : <Card card={card} location={"myHand"} width={cardWidth}/>}
                    </ListItem>)}
            </StyledList>
            {myHand.length > 5 && <StyledSpan>{myHand.length}</StyledSpan>}
            <HideHandIconButton onClick={() => setIsHandHidden(!isHandHidden)} isActive={isHandHidden}
                                title={"Hide hand"}>
                {isHandHidden
                    ? <VisibilityOffIcon sx={{ fontSize: cardWidth / 3.5 }}/>
                    : <VisibilityIcon sx={{ fontSize: cardWidth / 3.5 }}/>}
            </HideHandIconButton>
        </Container>
    );
}

const Container = styled.div`
  background: aquamarine;
  grid-area: hand;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  transform: translate(0px, 0px); // eye icon??
`;

const StyledList = styled.ul<{ cardCount: number }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 100%;
  height: 100%;
  list-style-type: none;
  position: relative;
`;

const ListItem = styled.li<{ cardCount: number, cardIndex: number, cardWidth: number }>`
  position: absolute;
  margin: 0;
  padding: 0;
  list-style-type: none;
  left: 4%;
  top: 0;
  transition: all 0.2s ease;
  transform: translateX(${({
                                                                                                        cardCount,
                                                                                                        cardIndex,
                                                                                                        cardWidth
                                                                                                    }) => calculateCardOffsetX(cardCount, cardIndex, cardWidth)}) translateY(${({
                                                                                                                                                                         cardCount,
                                                                                                                                                                         cardIndex
                                                                                                                                                                     }) => calculateCardOffsetY(cardCount, cardIndex)}) rotate(${({
                                                                                                                                                                                                                                      cardCount,
                                                                                                                                                                                                                                      cardIndex
                                                                                                                                                                                                                                  }) => calculateCardRotation(cardCount, cardIndex)});

  &:hover {
    z-index: 100;
  }
`;

const HideHandIconButton = styled.button<{ isActive: boolean}>`
  position: absolute;
  opacity: ${({isActive}) => isActive ? 1 : 0.3};
  color: ${({isActive}) => isActive ? "rgba(190,39,85,1)" : "unset"};
  right: 0.5%;
  top: -6%;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 5px;
  background: none;
  border: none;
  outline: none;
  transition: all 0.25s ease;

  &:hover {
    color: #d764c1;
    opacity: 0.75;
  }
`;

const StyledSpan = styled.span`
  font-family: Awsumsans, sans-serif;
  font-style: italic;
  font-size: 20px;
  opacity: 0.4;

  position: absolute;
  bottom: 7px;
  left: 223px;
`;

const FaceDownCard = styled.img`
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
