import arrowsAnimation from "../../assets/lotties/arrows.json";
import {Item, Submenu} from "react-contexify";
import {IconButton, Stack} from "@mui/material";
import styled from "@emotion/styled";
import Lottie from "lottie-react";
import {useEffect, useState} from "react";
import {AddCircleOutlined, RemoveCircleOutlined} from '@mui/icons-material';
import {useGame} from "../../hooks/useGame.ts";
import {CardModifiers, CardTypeGame} from "../../utils/types.ts";
import {playModifyCardSfx} from "../../utils/sound.ts";
import {getNumericModifier, tamersAsDigimon} from "../../utils/functions.ts";

type ModifierMenuProps = {
    sendSetModifiers: (cardId: string, location: string, modifiers: CardModifiers) => void
}

const battleKeywords = [
    "Alliance", "Alliance ×2", "Arm. Purge", "Barrier", "Blitz", "Blocker", "Collision", "Decoy", "Evade", "Fortitude",
    "Ice Armor", "Jamming", "Mat. Save", "Overclock", "Partition", "Piercing", "Raid", "Reboot", "Retaliation",
    "Retal. ×2", "Vortex"
];

export default function ModifierMenu({ sendSetModifiers } : ModifierMenuProps) {

    const cardToSend = useGame(state => state.cardToSend);
    const setModifiers = useGame(state => state.setModifiers);

    const card = useGame((state) => (state[cardToSend.location as keyof typeof state] as CardTypeGame[]).find(card => card.id === cardToSend.id));

    const [plusDp, setPlusDp] = useState<number>(0);
    const [plusSecurityAttacks, setPlusSecurityAttacks] = useState<number>(0);
    const [keywords, setKeywords] = useState<string[]>([]);

    const handleAddDp = () => setPlusDp((prev) => prev < 30000 ? prev + 1000 : prev);
    const handleSubDp = () => setPlusDp((prev) => prev > -30000 ? prev - 1000 : prev);
    const handleAddSec = () => setPlusSecurityAttacks((prev) => prev < 9 ? prev + 1 : prev);
    const handleSubSec = () => setPlusSecurityAttacks((prev) => prev > -9 ? prev - 1 : prev);

    function resetValues() {
        if(!card) return;
        setPlusDp(card?.modifiers.plusDp);
        setPlusSecurityAttacks(card?.modifiers.plusSecurityAttacks);
        setKeywords(card?.modifiers.keywords);
    }

    function handleSubmit() {
        const modifiers = {plusDp, plusSecurityAttacks, keywords};
        setModifiers(cardToSend.id, cardToSend.location, modifiers); // logic changed here?
        sendSetModifiers(cardToSend.id, cardToSend.location, modifiers);
        playModifyCardSfx();
    }
    
    useEffect(() => resetValues(), [cardToSend]);

    const dpValue = getNumericModifier(plusDp, true);
    const secAttackValue = getNumericModifier(plusSecurityAttacks, true);

    const haveModifiersChanged = card?.modifiers.plusDp !== plusDp
        || card?.modifiers.plusSecurityAttacks !== plusSecurityAttacks
        || card?.modifiers.keywords !== keywords;

    if ((card?.cardType !== "Digimon" && !tamersAsDigimon.includes(String(card?.cardNumber)))) return <></>;

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

                        <Stack direction={"row"} gap={0.5} maxWidth={"100%"} flexWrap={"wrap"}>
                            {keywords.map((keyword) =>
                                <ModifierSpan  onClick={() => setKeywords((prev) => prev.filter((kw) => kw !== keyword))}
                                               key={`${keyword}_active`}>{keyword}</ModifierSpan>)}
                        </Stack>

                        <Submenu label={"Add Keyword Tag"}
                                 arrow={<StyledLottie style={{ marginLeft: 60}} animationData={arrowsAnimation}/>} >
                            <StyledFieldset>
                                <Stack maxHeight={400} flexWrap={"wrap"}>
                                {battleKeywords.map((keyword) => !keywords.includes(keyword) &&
                                    <Item closeOnClick={false} disabled={keywords.length >= 6} key={`${keyword}_selection`}
                                          onClick={() => setKeywords([...keywords, keyword])}>{keyword}</Item>)}
                                </Stack>
                            </StyledFieldset>
                        </Submenu>
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

const ModifierSpan = styled.div`
  color: ghostwhite;
  background: linear-gradient(to top, #ce570d, #883b09);
  border-radius: 25px;
  height: 30px;
  text-align: center;
  transform: translateX(-4px);
  padding: 2px 5px 0 5px;
  transition: background 0.3s;
  cursor: pointer;
  &:hover {
    background: #cb2626;
  }
`;
