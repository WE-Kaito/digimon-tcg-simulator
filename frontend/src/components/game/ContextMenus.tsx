import styled from "@emotion/styled";
import {Item, ItemParams, Menu, Separator} from "react-contexify";
import {
    AdsClick as TargetIcon,
    BackHand as HandIcon,
    Backspace as ClearIcon,
    Curtains as RevealIcon,
    DeleteForever as TrashIcon,
    LocalFireDepartment as EffectIcon,
    Pageview as OpenSecurityIcon,
    ShuffleOnOutlined as ShuffleIcon,
    Search as DetailsIcon,
} from "@mui/icons-material";
import {CSSProperties} from "react";
import ModifierMenu from "./ModifierMenu.tsx";
import {convertForLog, numbersWithModifiers} from "../../utils/functions.ts";
import {useGeneralStates} from "../../hooks/useGeneralStates.ts";
import {useGameBoardStates} from "../../hooks/useGameBoardStates.ts";
import {useSound} from "../../hooks/useSound.ts";
import {
    CardModifiers,
    CardTypeGame,
    FieldCardContextMenuItemProps,
    HandCardContextMenuItemProps,
    OpenedCardModal
} from "../../utils/types.ts";
import "react-contexify/dist/ReactContexify.css";
import {WSUtils} from "../../pages/GamePage.tsx";
import {useGameUIStates} from "../../hooks/useGameUIStates.ts";

export default function ContextMenus({wsUtils} : { wsUtils?: WSUtils }) {
    const {sendMessage, sendChatMessage, sendSfx, sendUpdate, matchInfo, sendMoveCard} = wsUtils ?? {};

    const selectedCard = useGeneralStates((state) => state.selectedCard);

    const [setOpenedCardModal, setStackModal] = useGameUIStates((state) => [state.setOpenedCardModal, state.setStackModal])

    const [
        cardToSend,
        mySecurity,
        myHand,
        myDeckField,
        shuffleSecurity,
        getOpponentReady,
        moveCard,
        moveCardToStack,
        setCardIdWithEffect,
        setCardIdWithTarget,
        setModifiers,
    ] = useGameBoardStates((state) => [
        state.cardToSend,
        state.mySecurity,
        state.myHand,
        state.myDeckField,
        state.shuffleSecurity,
        state.getOpponentReady,
        state.moveCard,
        state.moveCardToStack,
        state.setCardIdWithEffect,
        state.setCardIdWithTarget,
        state.setModifiers,
    ]);
    const contextCard = useGameBoardStates((state) => (state[cardToSend.location as keyof typeof state] as CardTypeGame[])?.find(card => card.id === cardToSend.id));

    const [
        playShuffleDeckSfx,
        playDrawCardSfx,
        playTrashCardSfx,
        playRevealCardSfx,
        playUnsuspendSfx,
        playActivateEffectSfx,
        playTargetCardSfx,
        playModifyCardSfx
    ] = useSound((state) => [
        state.playRevealCardSfx,
        state.playShuffleDeckSfx,
        state.playDrawCardSfx,
        state.playTrashCardSfx,
        state.playUnsuspendSfx,
        state.playActivateEffectSfx,
        state.playTargetCardSfx,
        state.playModifyCardSfx
    ]);

    const hasModifierMenu = contextCard?.cardType === "Digimon" || numbersWithModifiers.includes(String(contextCard?.cardNumber));
    const hideMenuItemStyle = hasModifierMenu ? {} : {visibility: "hidden", position: "absolute"};

    function handleOpenSecurity() {
        setOpenedCardModal(OpenedCardModal.MY_SECURITY);
        sendMessage?.(matchInfo?.gameId + ":/openedSecurity:" + matchInfo?.opponentName);
        sendChatMessage?.(`[FIELD_UPDATE]≔【Opened Security】`);
    }

    function handleShuffleSecurity() {
        shuffleSecurity();
        playShuffleDeckSfx();
        sendUpdate?.();
        sendChatMessage?.(`[FIELD_UPDATE]≔【↻ Security Stack】`);
        sendSfx?.("playShuffleDeckSfx");
    }

    function moveSecurityCard(to: "myTrash" | "myHand", bottomCard?: boolean) {
        if (!getOpponentReady()) return;
        const card = (bottomCard) ? mySecurity[mySecurity.length - 1] : mySecurity[0];
        moveCard(card.id, "mySecurity", to);
        (to === "myHand") ? playDrawCardSfx() : playTrashCardSfx();
        sendMoveCard?.(card.id, "mySecurity", to);
        sendChatMessage?.(`[FIELD_UPDATE]≔【${to === "myHand" ? "Card" : card.name}】﹕Security ${bottomCard ? "Bot" : "Top"} ➟ ${convertForLog(to)}`);
        sendSfx?.((to === "myHand") ? "playDrawCardSfx" : "playTrashCardSfx");
    }

    function revealHandCard({props}: ItemParams<HandCardContextMenuItemProps>) {
        if (!getOpponentReady() || props === undefined) return;
        moveCard(myHand[props.index].id, "myHand", "myReveal");
        playRevealCardSfx();
        sendMoveCard?.(myHand[props.index].id, "myHand", "myReveal");
        sendChatMessage?.(`[FIELD_UPDATE]≔【${myHand[props.index].name}】﹕…${myHand[props.index].id.slice(-5)}(ID) at Hand ➟ Reveal`);
        sendSfx?.("playRevealSfx");
    }

    function moveDeckCard(to: string, bottomCard?: boolean) {
        if (!getOpponentReady()) return;
        const cardId = (bottomCard) ? myDeckField[myDeckField.length - 1].id : myDeckField[0].id;
        switch (to) {
            case "myReveal":
                playRevealCardSfx();
                moveCard(cardId, "myDeckField", "myReveal");
                sendMoveCard?.(cardId, "myDeckField", "myReveal");
                sendSfx?.("playRevealSfx");
                if (bottomCard) sendChatMessage?.(`[FIELD_UPDATE]≔【${myDeckField[myDeckField.length - 1].name}】﹕Deck Bottom ➟ Reveal`);
                else sendChatMessage?.(`[FIELD_UPDATE]≔【${myDeckField[0].name}】﹕Deck ➟ Reveal`);
                break;
            case "myTrash":
                playTrashCardSfx();
                moveCard(cardId, "myDeckField", "myTrash");
                sendMoveCard?.(cardId, "myDeckField", "myTrash");
                sendChatMessage?.(`[FIELD_UPDATE]≔【${myDeckField[0].name}】﹕Deck ➟ Trash`);
                sendSfx?.("playTrashCardSfx");
                break;
            case "mySecurity":
                playUnsuspendSfx();
                moveCardToStack("Top", cardId, "myDeckField", "mySecurity");
                sendMessage?.(`${matchInfo?.gameId}:/moveCardToStack:${matchInfo?.opponentName}:Top:${cardId}:${location}:${to}:false`);
                sendChatMessage?.(`[FIELD_UPDATE]≔【Top Deck Card】﹕➟ Security Top`)
                sendSfx?.("playUnsuspendCardSfx");
                break;
            case "myHand":
                playDrawCardSfx();
                moveCard(cardId, "myDeckField", "myHand");
                sendMoveCard?.(cardId, "myDeckField", "myHand");
                sendChatMessage?.(`[FIELD_UPDATE]≔【Draw Card】`);
                sendSfx?.("playDrawCardSfx");
                break;
        }
    }

    function showStack({props}: ItemParams<FieldCardContextMenuItemProps>) {
        if (!getOpponentReady() || props === undefined) return;
        const {location} = props;
        setStackModal(location);
    }

    function activateEffectAnimation({props}: ItemParams<FieldCardContextMenuItemProps>) {
        if (!getOpponentReady() || props === undefined) return;
        const {name, id, location} = props;
        setCardIdWithEffect(id);
        playActivateEffectSfx();
        sendMessage?.(`${matchInfo?.gameId}:/activateEffect:${matchInfo?.opponentName}:${id}`);
        sendChatMessage?.(`[FIELD_UPDATE]≔【${name} at ${convertForLog(location)}】﹕✨ EFFECT ✨`);
        sendSfx?.("playActivateEffectSfx");
        const timer = setTimeout(() => setCardIdWithEffect(""), 2600);
        return () => clearTimeout(timer);
    }

    function activateTargetAnimation({props}: ItemParams<FieldCardContextMenuItemProps>) {
        if (!getOpponentReady() || props === undefined) return;
        const {name, id, location} = props;
        const logName = (location === "opponentHand") ? `…${id.slice(-5)}(ID)` : name;
        setCardIdWithTarget(id);
        playTargetCardSfx();
        sendSfx?.("playTargetCardSfx");
        sendMessage?.(`${matchInfo?.gameId}:/activateTarget:${matchInfo?.opponentName}:${id}`);
        sendChatMessage?.(`[FIELD_UPDATE]≔【${logName} at ${convertForLog(location)}】﹕💥 TARGETED 💥`);
        const timer = setTimeout(() => setCardIdWithTarget(""), 3500);
        return () => clearTimeout(timer);
    }

    function sendSetModifiers(cardId: string, location: string, modifiers: CardModifiers) {
        sendMessage?.(`${matchInfo?.gameId}:/setModifiers:${matchInfo?.opponentName}:${cardId}:${location}:${JSON.stringify(modifiers)}`);
        sendSfx?.("playModifyCardSfx");
    }

    function resetModifiers({props}: ItemParams<FieldCardContextMenuItemProps>) {
        if (props === undefined) return;
        const modifiers = {plusDp: 0, plusSecurityAttacks: 0, keywords: [], colors: contextCard?.color ?? []};
        setModifiers(props?.id, props?.location, modifiers);
        playModifyCardSfx();
        sendSetModifiers(props?.id, props?.location, modifiers);
    }

    return (
        <>
            <StyledMenu id={"deckMenu"} theme="dark">
                <Item onClick={() => moveDeckCard("myReveal", true)}>Reveal Bottom Deck Card ↺</Item>
            </StyledMenu>

            <StyledMenu id={"handCardMenu"} theme="dark">
                <Item onClick={revealHandCard}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Reveal Card</span> <RevealIcon/></div>
                </Item>
            </StyledMenu>

            <StyledMenu id={"fieldCardMenu"} theme="dark">
                <Item onClick={showStack}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Show Stack</span> <DetailsIcon/></div>
                </Item>
                <Separator/>
                <Item onClick={activateEffectAnimation}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Activate Effect</span> <EffectIcon/></div>
                </Item>
                <Item onClick={activateTargetAnimation}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Target Card</span> <TargetIcon/></div>
                </Item>
                {hasModifierMenu && <Separator/>}
                <Item onClick={resetModifiers} style={(hideMenuItemStyle as CSSProperties | undefined)}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Clear Modifiers</span> <ClearIcon/></div>
                </Item>
                <ModifierMenu sendSetModifiers={sendSetModifiers}/>
            </StyledMenu>

            <StyledMenu id={"modalMenuOpponent"} theme="dark">
                <Item onClick={activateTargetAnimation}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Target Card</span> <TargetIcon/></div>
                </Item>
            </StyledMenu>

            <StyledMenu id={"modalMenu"} theme="dark">
                <Item onClick={activateEffectAnimation}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Activate Effect</span> <EffectIcon/></div>
                </Item>
                <Item onClick={activateTargetAnimation}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Target Card</span> <TargetIcon/></div>
                </Item>
            </StyledMenu>

            <StyledMenu id={"opponentCardMenu"} theme="dark">
                <Item onClick={showStack}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>View Stack</span> <DetailsIcon/></div>
                </Item>
                <Separator/>
                <Item onClick={activateTargetAnimation}>
                    <div style={{display: "flex", justifyContent: "space-between", width: "100%"}}>
                        <span>Target Card</span> <TargetIcon/></div>
                </Item>
            </StyledMenu>

            <StyledMenu id={"securityStackMenu"} theme="dark">
                <Item onClick={handleOpenSecurity}>
                    <StyledOpenSecurityIcon color={"warning"} sx={{marginRight: 1}}/>
                    Open Security Stack
                </Item>
                <Item onClick={() => moveSecurityCard("myTrash")}>
                    <div style={{position: "relative", marginRight: 8, transform: "translate(-1px, 2px)"}}>
                        <StyledTrashIcon color={"error"}/><MiniArrowSpan>▲</MiniArrowSpan>
                    </div>
                    Trash Top Card
                </Item>
                <Item onClick={() => moveSecurityCard("myTrash", true)}>
                    <div style={{position: "relative", marginRight: 8, transform: "translate(-1px, 2px)"}}>
                        <StyledTrashIcon color={"error"}/><MiniArrowSpan>▼</MiniArrowSpan>
                    </div>
                    Trash Bot Card
                </Item>
                <Item onClick={() => moveSecurityCard("myHand")}>
                    <div style={{position: "relative", marginLeft: 2, marginRight: 14}}>
                        <StyledHandIcon fontSize="inherit"/>
                        <MiniArrowSpanHand>▲</MiniArrowSpanHand>
                    </div>
                    Take Top Card
                </Item>
                <Item onClick={() => moveSecurityCard("myHand", true)}>
                    <div style={{position: "relative", marginLeft: 2, marginRight: 14}}>
                        <StyledHandIcon fontSize="inherit"/>
                        <MiniArrowSpanHand>▼</MiniArrowSpanHand>
                    </div>
                    Take Bot Card
                </Item>
                <Item onClick={handleShuffleSecurity}>
                    <StyledShuffleIcon sx={{color: "#42a5f5", fontSize: 20, marginRight: 1.6}}/>
                    Shuffle Security Stack
                </Item>
            </StyledMenu>

            {selectedCard && <StyledMenu id={"detailsImageMenu"} theme="dark">
                <Item onClick={() => window.open(selectedCard.imgUrl, '_blank')}>Open Image in new Tab ↗</Item>
            </StyledMenu>}
        </>
    );
}

export const StyledMenu = styled(Menu)`
  border: 2px solid rgba(65, 135, 211, 0.72);

  .contexify_submenu {
    background-color: transparent;
    transform: translateX(-6px);
    box-shadow: none;
  }

  .contexify_submenu-arrow {
    background: none;
  }

  .contexify_separator {
    border-bottom: 2px solid rgba(65, 135, 211, 0.72);
  }

  .contexify_item:hover {
    font-weight: 600;
  }
`;

const MiniArrowSpan = styled.span`
  position: absolute;
  left: 14px;
  top: 0;
  font-size: 10px;
  color: #646cff;
  filter: drop-shadow(0 0 2px #000000);
`;

const MiniArrowSpanHand = styled(MiniArrowSpan)`
  left: 11px;
`;

const StyledShuffleIcon = styled(ShuffleIcon)`
  border-radius: 6px;
`;

const StyledTrashIcon = styled(TrashIcon)`
  border-radius: 6px;
  filter: drop-shadow(0px 0px 1px var(--contexify-menu-bgColor));
`;

const StyledOpenSecurityIcon = styled(OpenSecurityIcon)`
  border-radius: 6px;
`;

const StyledHandIcon = styled(HandIcon)`
  border-radius: 8px;
  filter: drop-shadow(0px 0px 1px var(--contexify-menu-bgColor));
  transform: rotateY(180deg);
  color: #ffccbc;
`;
