import DigimonField from "./DigimonField.tsx";
import LinkField from "./LinkField.tsx";
import { SIDE } from "../../utils/types.ts";
import { WSUtils } from "../../pages/GamePage.tsx";

type BattleAreaProps = {
    side: SIDE;
    wsUtils?: WSUtils;
};

export default function BattleArea({ side, wsUtils }: BattleAreaProps) {
    return (
        <>
            {Array.from({ length: 13 }).map((_, index) => (
                <DigimonField key={`${side}DigimonField${index}`} num={index + 1} side={side} wsUtils={wsUtils} />
            ))}
            {Array.from({ length: 8 }).map((_, index) => (
                <LinkField key={`${side}LinkField${index}`} num={index + 1} side={side} wsUtils={wsUtils} />
            ))}
        </>
    );
}
