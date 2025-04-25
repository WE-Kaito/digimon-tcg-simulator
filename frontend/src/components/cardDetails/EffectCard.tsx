import styled from "@emotion/styled";
import { CallMade as InheritedIcon, Lock as SecurityIcon, InsertLinkRounded as LinkIcon } from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { JSX } from "react";
import HighlightedKeyWords from "./HighlightedKeyWords.tsx";

export enum EffectVariant {
    MAIN = "main",
    INHERITED = "inherited",
    SECURITY = "security",
    SPECIAL = "special",
    INHERITED_FROM_DIGIVOLUTION_CARDS = "digivolution cards",
    LINK = "link",
}

type Props = {
    variant: EffectVariant;
    children: JSX.Element;
};

export function EffectCard({ children, variant }: Props) {
    const location = useLocation();
    const inGame = location.pathname === "/game";
    const isInheritCardInfo = variant === EffectVariant.INHERITED_FROM_DIGIVOLUTION_CARDS;

    return (
        <Wrapper inherited={isInheritCardInfo} style={variant === EffectVariant.SPECIAL ? specialStyle : undefined}>
            {variant !== EffectVariant.SPECIAL && variant !== EffectVariant.LINK ? (
                <EffectText inGame={inGame}>
                    <EffectHeader>
                        <span>
                            {variant.toUpperCase()} {!isInheritCardInfo && "EFFECT"}
                        </span>
                        {variant === EffectVariant.SECURITY && (
                            <SecurityIcon
                                sx={{ width: 16, position: "absolute", transform: "translate(2px, -11px)" }}
                            />
                        )}
                        {variant === EffectVariant.INHERITED && (
                            <InheritedIcon
                                sx={{ width: 17, position: "absolute", transform: "translate(2px, -11px)" }}
                            />
                        )}
                        {isInheritCardInfo && (
                            <InheritedIcon
                                sx={{
                                    width: 20,
                                    position: "absolute",
                                    transform: "translate(2px, -9px) scale(-1)",
                                    filter: "drop-shadow(0 0 2px #0000ff)",
                                }}
                            />
                        )}
                    </EffectHeader>
                    <hr style={{ transform: "translateY(2px) scaleX(1.025)", opacity: 0.4 }} />
                    {children}
                </EffectText>
            ) : (
                <EffectText style={{ padding: "3px 5px 0 5px" }} inGame={inGame}>
                    {children}
                </EffectText>
            )}
        </Wrapper>
    );
}

export function LinkEffectCard({ linkCardInfo }: { linkCardInfo: { dp: number; effect: string }[] }) {
    const totalDp = linkCardInfo.reduce((sum, card) => sum + card.dp, 0);
    const effects = linkCardInfo.map((card) => card.effect).join("\n");

    return (
        <Wrapper
            style={{
                background:
                    "linear-gradient(to right top, rgba(47,225,172,0.15) 0%, rgba(67,245,192,0.15) 20%, rgba(67,245,192,0.15) 75%, rgba(77,255, 200,0.1) 100%)",
            }}
        >
            <EffectText inGame={true}>
                <EffectHeader>
                    <span>LINKED CARDS</span>
                    <LinkIcon
                        sx={{
                            fontSize: 30,
                            position: "absolute",
                            transform: "translate(5px, -12px)",
                            filter: "drop-shadow(0 0 1px #00ff00)",
                        }}
                    />
                    <span style={{ position: "absolute", right: 0, fontWeight: "bolder" }}>{`+ ${totalDp} DP`}</span>
                </EffectHeader>
                <hr style={{ transform: "translateY(2px) scaleX(1.025)", opacity: 0.4 }} />
                <span style={{ textShadow: "0 0 3px #000000" }}>
                    <HighlightedKeyWords text={effects} />
                </span>
            </EffectText>
        </Wrapper>
    );
}

const Wrapper = styled.div<{ inherited?: boolean }>`
    width: 99.25%;
    position: relative;
    color: ghostwhite;
    background: ${({ inherited }) =>
        inherited
            ? "linear-gradient(to right top, rgba(37,170,225,0.2) 0%, rgba(57,190,255,0.2) 20%, rgba(67,190,255,0.2) 75%, rgba(67,200,250,0.15) 100%)"
            : "rgba(12, 21, 16, 0.25)"};
    border: 1px solid rgba(124, 124, 118, 0.4);
    border-radius: 3px;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.05);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));
`;

export const EffectText = styled.div<{ inGame?: boolean }>`
    font-family:
        League Spartan,
        sans-serif;
    font-weight: 300;
    font-size: ${({ inGame }) => (inGame ? "1.25em" : "1rem")};
    text-align: left;
    padding: 5px;

    @media (max-width: 767px) {
        font-size: ${({ inGame }) => (inGame ? "1.5rem" : "1rem")};
    }
`;

const EffectHeader = styled.div`
    width: 100%;
    text-align: start;
    line-height: 0.4;
    transform: translateY(0.35rem);
    position: relative;
    z-index: 2;
`;

const specialStyle = {
    backgroundImage: `
    radial-gradient(circle at 15% 25%, rgba(0, 255, 180, 0.25) 0%, transparent 3%),
    radial-gradient(circle at 35% 45%, rgba(0, 220, 255, 0.22) 0%, transparent 3%),
    radial-gradient(circle at 55% 65%, rgba(100, 255, 200, 0.18) 0%, transparent 3%),
    radial-gradient(circle at 75% 25%, rgba(0, 255, 160, 0.20) 0%, transparent 3%),
    radial-gradient(circle at 90% 50%, rgba(0, 180, 255, 0.17) 0%, transparent 3%),
    radial-gradient(circle at 20% 75%, rgba(50, 255, 180, 0.2) 0%, transparent 3%),
    radial-gradient(circle at 65% 85%, rgba(0, 255, 140, 0.19) 0%, transparent 3%),
    linear-gradient(135deg, rgba(10, 20, 25, 0.1), rgba(5, 15, 20, 0.1))
  `,
    border: "1px solid rgba(6, 164, 159, 0.55)",
    boxShadow: "inset 0 0 5px rgba(0, 255, 255, 0.5)",
};
