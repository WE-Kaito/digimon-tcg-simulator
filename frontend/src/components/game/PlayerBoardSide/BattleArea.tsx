import CardStack from "../CardStack.tsx";
import styled from "@emotion/styled";
import {useGame} from "../../../hooks/useGame.ts";
import {CardTypeGame, SIDE} from "../../../utils/types.ts";
import {useContextMenu} from "react-contexify";
import EggIcon from '@mui/icons-material/Egg';

type BattleAreaProps =
    | {
    num: number;
    side: SIDE;
    isBreeding?: never;
}
    | {
    isBreeding: true;
    num?: never;
    side: SIDE;
};

export default function BattleArea(props : BattleAreaProps) {
    const {num, side, isBreeding} = props;
    const location = isBreeding ? `${side}BreedingArea` : `${side}Digi${num}`;

    const locationCards = useGame((state) => state[location as keyof typeof state] as CardTypeGame[]);

    const {show: showFieldCardMenu} = useContextMenu({id: "fieldCardMenu", props: {index: -1, location: "", id: ""}});
    const {show: showOpponentCardMenu} = useContextMenu({id: "opponentCardMenu", props: {index: -1, location: "", id: ""}});
    // TODO: add ref dropToDigi${num} to container
    return (
        <Container {...props} id={location}>
            {isBreeding && <StyledEggIcon side={side} />}
            {!!locationCards.length &&
                <CardStack cards={locationCards} location={location} opponentSide={side === SIDE.OPPONENT}
                // sendSfx={sendSfx}
                // sendTiltCard={sendTiltCard}
                // handleDropToStackBottom={handleDropToStackBottom}
                        showFieldCardMenu={showFieldCardMenu}
                        showOpponentCardMenu={showOpponentCardMenu}
                />
            }
        </Container>
    );
}

const Container = styled.div<BattleAreaProps>`
  grid-area: ${({num}) => num ? `BA${num}` : "breeding"};
  position: relative;
  height: calc(100% - 6px);
  width: calc(100% - 6px);
  border-radius: 2px;
  display: flex;
  flex-direction: ${({isBreeding, num}) => (isBreeding || num <= 10) ? "column" : "row"};
  justify-content: center;
  align-items: center;
  background: rgba(20, 20, 20, 0.25);
  box-shadow: inset 0 0 20px rgba(113, 175, 201, 0.2);
  outline: ${({side}) => side === SIDE.MY ? "2px solid rgba(167, 189, 219, 0.5)" : "2px solid rgba(56, 38, 38, 0.5)"};
`;

const StyledEggIcon = styled(EggIcon)<{ side: SIDE }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(${({side}) => side === SIDE.MY ? "0" : "180deg"});
  opacity: 0.5;
  font-size: 4em;
  @media (max-height: 500px) {
    font-size: 1.5em;
  }
`;
