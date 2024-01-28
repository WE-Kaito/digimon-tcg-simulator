import {CardTypeWithId} from "../../utils/types.ts";
import {lazy, useState} from "react";
import {
    LooksOneTwoTone as RestrictedIcon,
    RemoveCircle as ForbiddenIcon
} from '@mui/icons-material';

const Card = lazy(() => import('../Card.tsx'));

export default function FetchCard({card}: { card: CardTypeWithId }) {

    const [imageError, setImageError] = useState(false);

    return (
        !imageError || card.cardNumber === card.uniqueCardNumber
            ? <div style={{ position: "relative", height: "fit-content", width: "fit-content" }}>
                <Card key={card.uniqueCardNumber} card={card} location={"fetchedData"} setImageError={setImageError}/>
                {card.restriction_en === "Restricted to 1" && <RestrictedIcon color={card.color.includes("Red") ? "warning" : "error"} fontSize={"large"} sx={{background: "rgba(8,8,8,0.5)", borderRadius: "5px", position: "absolute", bottom: 8, right: 3, pointerEvents: "none"}}/>}
                {card.restriction_en === "Banned" && <ForbiddenIcon color={card.color.includes("Red") ? "warning" : "error"} fontSize={"large"} sx={{position: "absolute", bottom: 8, right: 5, pointerEvents: "none"}}/>}
              </div>
            : <></>
    );
}
