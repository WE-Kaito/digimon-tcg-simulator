import {WSUtils} from "../../../pages/GamePage.tsx";
import {useGameBoardStates} from "../../../hooks/useGameBoardStates.ts";
import ModalDialog from "./ModalDialog.tsx";
import {useSound} from "../../../hooks/useSound.ts";
import {CardType, SIDE} from "../../../utils/types.ts";
import {uid} from "uid";
import {tokenCollection} from "../../../utils/tokens.ts";
import {useGeneralStates} from "../../../hooks/useGeneralStates.ts";
import {useGameUIStates} from "../../../hooks/useGameUIStates.ts";

export default function TokenModal( { wsUtils }: { wsUtils?: WSUtils } ) {
    const setHoverCard = useGeneralStates((state) => state.setHoverCard);
    const [tokenModal, setTokenModal] = useGameUIStates((state) => [state.tokenModal, state.setTokenModal]);
    const createToken = useGameBoardStates((state) => state.createToken);

    const playPlaceCardSfx = useSound((state) => state.playPlaceCardSfx);

    function handleCreateToken(token: CardType) {
        const id = "TOKEN-" + uid();
        createToken(token, SIDE.MY, id);
        playPlaceCardSfx();
        setTokenModal(false);
        wsUtils?.sendMessage(`${id}:/createToken:${wsUtils.matchInfo.opponentName}:${id}:${token.name}`);
        wsUtils?.sendSfx("playPlaceCardSfx");
        wsUtils?.sendChatMessage(`[FIELD_UPDATE]≔【Spawn ${token.name}-Token】`);
    }

    const onHover = (token: CardType) => setHoverCard({...token, id: uid()})

    const buttonProps = [...tokenCollection.map((token) => (
        { text: token.name, onClick: () => handleCreateToken(token), onHover: () => onHover(token), color: "#e8bf1a" })),
        { text: "CANCEL", onClick: () => setTokenModal(false), color: "#D9D9D9" }
    ];

    if(!tokenModal) return <></>;

    return <ModalDialog text={"Choose a token to place:"} buttonProps={buttonProps} />;
}