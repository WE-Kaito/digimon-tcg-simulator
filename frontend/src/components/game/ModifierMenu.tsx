import arrowsAnimation from "../../assets/lotties/arrows.json";
import {Item, Submenu} from "react-contexify";
import {IconButton, Stack} from "@mui/material";
import styled from "@emotion/styled";
import Lottie from "lottie-react";
import {useEffect, useState} from "react";
import {AddCircleOutlined, RemoveCircleOutlined } from '@mui/icons-material';
import {useGame} from "../../hooks/useGame.ts";
import {CardModifiers} from "../../utils/types.ts";
import {playModifyCardSfx} from "../../utils/sound.ts";

type ModifierMenuProps = {
    sendSetModifiers: (cardId: string, location: string, modifiers: CardModifiers) => void
}

export function getNumericModifier(value: number, isSetting?: boolean) {
    if (value === 0 && !isSetting) return "";
    return value < 0 ? value.toString() : `+${value}`;
}

export default function ModifierMenu({ sendSetModifiers } : ModifierMenuProps) {

    const cardToSend = useGame(state => state.cardToSend);
    const setModifiers = useGame(state => state.setModifiers);
    // @ts-ignore
    const card = useGame((state) => state[cardToSend.location as keyof typeof state].find(card => card.id === cardToSend.id)) ?? null;

    const [plusDp, setPlusDp] = useState<number>(0);
    const [plusSecurityAttacks, setPlusSecurityAttacks] = useState<number>(0);

    const handleAddDp = () => setPlusDp((prev) => prev < 30000 ? prev + 1000 : prev);
    const handleSubDp = () => setPlusDp((prev) => prev > -30000 ? prev - 1000 : prev);
    const handleAddSec = () => setPlusSecurityAttacks((prev) => prev < 9 ? prev + 1 : prev);
    const handleSubSec = () => setPlusSecurityAttacks((prev) => prev > -9 ? prev - 1 : prev);

    function resetValues() {
        setPlusDp(card?.modifiers.plusDp);
        setPlusSecurityAttacks(card?.modifiers.plusSecurityAttacks);
    }

    function handleSubmit() {
        const modifiers = {plusDp, plusSecurityAttacks};
        setModifiers(cardToSend.id, cardToSend.location, modifiers);
        sendSetModifiers(cardToSend.id, cardToSend.location, modifiers);
        playModifyCardSfx();
    }
    
    useEffect(() => resetValues(), [cardToSend]);

    const dpValue = getNumericModifier(plusDp, true);
    const secAttackValue = getNumericModifier(plusSecurityAttacks, true);

    const haveModifiersChanged = card?.modifiers.plusDp !== plusDp || card?.modifiers.plusSecurityAttacks !== plusSecurityAttacks;

    if (card?.cardType !== "Digimon") return <></>;

    return (
        <StyledSubmenu label={"Set Modifiers"} arrow={<StyledLottie animationData={arrowsAnimation}/>} >
            <Item disabled style={{opacity: 1 }}>
                <StyledFieldset>
                    <legend style={{ filter: "drop-shadow(0 0 2px #4187D3FF)"}}>Modifiers</legend>
                    <Stack alignItems={"flex-start"} gap={"5px"}>
                        <NumericStack >
                            <ValueLabelSpan>DP</ValueLabelSpan>
                            <IconButton onClick={handleSubDp} color={"error"}><RemoveCircleOutlined/></IconButton>
                            <ValueSpan>{dpValue}</ValueSpan>
                            <IconButton onClick={handleAddDp} color={"success"}><AddCircleOutlined/></IconButton>
                        </NumericStack>
                        <NumericStack >
                            <ValueLabelSpan>Security Attack</ValueLabelSpan>
                            <IconButton onClick={handleSubSec} color={"error"}><RemoveCircleOutlined/></IconButton>
                            <ValueSpan >{secAttackValue}</ValueSpan>
                            <IconButton onClick={handleAddSec} color={"success"}><AddCircleOutlined/></IconButton>
                        </NumericStack>
                        <SubmitItem disabled={!haveModifiersChanged} onClick={handleSubmit}><span>SAVE VALUES</span></SubmitItem>
                    </Stack>
                </StyledFieldset>
            </Item>
        </StyledSubmenu>
    );
}

const StyledSubmenu = styled(Submenu)`
  .contexify_item-disabled {
    box-shadow: unset;
  }
`;

const StyledLottie = styled(Lottie)`
  width: 50px;
  margin-right: 1px;
  background: none!important;
`;

const StyledFieldset = styled.fieldset`
  border: 2px solid #4187D3FF;
  background: #0c0c0c;
  border-radius: 5px;
  margin: 0;
`;

const NumericStack = styled(Stack)`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 0 6px 0 6px;
`;

const ValueLabelSpan = styled.span`
  width: 110px;
  text-align: left;
`;

const ValueSpan = styled.span`
  width: 50px;
  text-align: center;
  transform: translateX(-4px);
`

const SubmitItem = styled(Item)`
  border-radius: 5px;
  width: 100%;
  box-shadow: 0 0 3px #2e89ee;
  background: #1a1a1a;

  span {
    width: 100%;
    text-align: center;
    font-family: Naston, sans-serif;
    letter-spacing: 2px;
  }
`;
