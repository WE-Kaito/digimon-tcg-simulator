import { CardTypeWithId } from "../../utils/types.ts";
import {lazy, useState} from "react";
import { LooksOneTwoTone as RestrictedIcon, RemoveCircle as ForbiddenIcon } from '@mui/icons-material';
import {useGeneralStates} from "../../hooks/useGeneralStates.ts";
const DeckbuilderCard = lazy(() => import('./DeckbuilderCard.tsx'));

export default function FetchCard({card}: { card: CardTypeWithId}) {

    const selectCard = useGeneralStates((state) => state.selectCard);

    const [imageError, setImageError] = useState(false);

    return (
        !imageError || card.cardNumber === card.uniqueCardNumber
            ? <div style={{ position: "relative", height: "fit-content" }} onContextMenu={() => selectCard(card)} id={card.uniqueCardNumber} >
                <DeckbuilderCard card={card} location={"fetchedData"} setImageError={setImageError}/>
                {card.restrictions.english === "Restricted to 1" && <RestrictedIcon color={card.color.includes("Red") ? "warning" : "error"} fontSize={"large"} sx={{background: "rgba(8,8,8,0.5)", borderRadius: "5px", position: "absolute", bottom: 8, right: 3, pointerEvents: "none"}}/>}
                {["Banned","Unreleased"].includes(card.restrictions.english) && <ForbiddenIcon color={card.color.includes("Red") ? "warning" : "error"} fontSize={"large"} sx={{position: "absolute", bottom: 8, right: 5, pointerEvents: "none"}}/>}
              </div>
            : <></>
    );
}