import {CardTypeWithId} from "../../utils/types.ts";
import {lazy, useState} from "react";

const Card = lazy(() => import('../Card.tsx'));

export default function FetchCard({card}: { card: CardTypeWithId }) {

    const [imageError, setImageError] = useState(false);

    return (
        !imageError
            ? <Card key={card.uniqueCardNumber} card={card} location={"fetchedData"} setImageError={setImageError}/>
            : <></>
    );
}