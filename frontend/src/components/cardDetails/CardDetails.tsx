import styled from "@emotion/styled";
import { useGeneralStates } from "../../hooks/useGeneralStates.ts";
import HighlightedKeyWords from "./HighlightedKeyWords.tsx";
import { EffectCard, LinkEffectCard, EffectText, RuleEffectCard } from "./EffectCard.tsx";
import { Stack, Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import { getCardTypeImage } from "../../utils/functions.ts";
import { CardTypeGame, CardTypeWithId } from "../../utils/types.ts";
import { useLocation } from "react-router-dom";
import { useGameBoardStates } from "../../hooks/useGameBoardStates.ts";
import ColorSpan from "./ColorSpan.tsx";
import { styled as muiStyled } from "@mui/material/styles";
import { indigo } from "@mui/material/colors";
import { DetailsView, useSettingStates } from "../../hooks/useSettingStates.ts";
import { EffectVariant } from "./EffectVariant.ts";
import virusImage from "../../assets/attribute_icons/virus.png";
import dataImage from "../../assets/attribute_icons/data.png";
import vaccineImage from "../../assets/attribute_icons/vaccine.png";
import freeImage from "../../assets/attribute_icons/free.png";
import variableImage from "../../assets/attribute_icons/variable.png";
import unknownImage from "../../assets/attribute_icons/unknown.png";
import godIconSrc from "../../assets/attribute_icons/appmon/god.png";
import gameIconSrc from "../../assets/attribute_icons/appmon/game.png";
import lifeIconSrc from "../../assets/attribute_icons/appmon/life.png";
import naviIconSrc from "../../assets/attribute_icons/appmon/navi.png";
import socialIconSrc from "../../assets/attribute_icons/appmon/social.png";
import systemIconSrc from "../../assets/attribute_icons/appmon/system.png";
import toolIconSrc from "../../assets/attribute_icons/appmon/tool.png";

const HybridNames = [
    "Takuya Kanbara",
    "Koji Minamoto",
    "Koichi Kimura",
    "Tommy Himi",
    "Zoe Orimoto",
    "J.P. Shibayama",
    "Satsuki Tamahime",
    "Eiji Nagasumi",
    "Marvin Jackson",
    "Xu Yulin",
    "Hacker Judge",
    "Kosuke Kisakata",
];

function getAttributeImage(attribute: string | null | undefined) {
    switch (attribute) {
        case "Virus":
            return virusImage;
        case "Data":
            return dataImage;
        case "Vaccine":
            return vaccineImage;
        case "Free":
            return freeImage;
        case "Variable":
            return variableImage;
        case "Unknown":
            return unknownImage;
        case "God":
            return godIconSrc;
        case "Game":
            return gameIconSrc;
        case "Life":
            return lifeIconSrc;
        case "Navi":
            return naviIconSrc;
        case "Social":
            return socialIconSrc;
        case "System":
            return systemIconSrc;
        case "Tool":
            return toolIconSrc;
        case "default":
            return;
    }
}

export default function CardDetails() {
    const location = useLocation();
    const inGame = location.pathname === "/game" || location.pathname === "/test";

    const selectedCard: CardTypeWithId | CardTypeGame | null = useGeneralStates((state) => state.selectedCard);
    const hoverCard: CardTypeWithId | CardTypeGame | null = useGeneralStates((state) => state.hoverCard);
    const inheritCardInfo = useGameBoardStates((state) => state.inheritCardInfo);
    const linkCardInfo = useGameBoardStates((state) => state.linkCardInfo);
    const details = useSettingStates((state) => state.details);

    const name = hoverCard?.name ?? selectedCard?.name;
    const cardType = hoverCard?.cardType ?? selectedCard?.cardType;

    const isNameLong = Boolean(
        hoverCard ? hoverCard.name?.length >= 30 : selectedCard && selectedCard?.name.length >= 30
    );
    const attribute = hoverCard?.attribute ?? (!hoverCard ? selectedCard?.attribute : null);
    const digiTypes = hoverCard?.digiType ?? (!hoverCard ? selectedCard?.digiType : null);

    // effect texts
    const mainEffectText = hoverCard?.mainEffect ?? (!hoverCard ? (selectedCard?.mainEffect ?? "") : "");
    const inheritedEffectText = hoverCard?.inheritedEffect ?? (!hoverCard ? (selectedCard?.inheritedEffect ?? "") : "");
    const securityEffectText = hoverCard?.securityEffect ?? (!hoverCard ? (selectedCard?.securityEffect ?? "") : "");
    const specialDigivolveText =
        hoverCard?.specialDigivolve ?? (!hoverCard ? (selectedCard?.specialDigivolve ?? "") : "");
    const burstDigivolveText = hoverCard?.burstDigivolve ?? (!hoverCard ? (selectedCard?.burstDigivolve ?? "") : "");
    const digiXrosText = hoverCard?.digiXros ?? (!hoverCard ? (selectedCard?.digiXros ?? "") : "");
    const dnaDigivolutionText = hoverCard?.dnaDigivolve ?? (!hoverCard ? (selectedCard?.dnaDigivolve ?? "") : "");
    const ruleText = hoverCard?.rule ?? (!hoverCard ? (selectedCard?.rule ?? "") : "");
    const linkDP = hoverCard?.linkDP ?? (!hoverCard ? (selectedCard?.linkDP ?? 0) : 0);
    const linkEffectText = hoverCard?.linkEffect ?? (!hoverCard ? (selectedCard?.linkEffect ?? "") : "");
    const linkRequirementText = hoverCard?.linkRequirement ?? (!hoverCard ? (selectedCard?.linkRequirement ?? "") : "");
    const assemblyEffectText = hoverCard?.assemblyEffect ?? (!hoverCard ? (selectedCard?.assemblyEffect ?? "") : "");

    // details
    const aceEffect = hoverCard?.aceEffect ?? (!hoverCard ? selectedCard?.aceEffect : null);
    const aceIndex = aceEffect?.indexOf("-") ?? -1;
    const aceOverflow = aceEffect ? aceEffect[aceIndex + 1] : null;

    const cardNumber = hoverCard?.cardNumber ?? selectedCard?.cardNumber;
    const level = hoverCard?.level ?? (!hoverCard ? (selectedCard?.level ?? 0) : 0);
    const playCost = hoverCard?.playCost ?? (!hoverCard ? (selectedCard?.playCost ?? 0) : 0);
    const digivolveConditions =
        hoverCard?.digivolveConditions ?? (!hoverCard ? (selectedCard?.digivolveConditions ?? []) : []);
    const dp = hoverCard?.dp ?? (!hoverCard ? (selectedCard?.dp ?? 0) : 0);
    const stage = hoverCard?.stage ?? (!hoverCard ? (selectedCard?.stage ?? "") : "");
    const illustrator = hoverCard?.illustrator ?? (!hoverCard ? (selectedCard?.illustrator ?? "") : "");
    const rulingsUrl = `https://digimoncardgame.fandom.com/wiki/${cardNumber}/Rulings`;

    const notHybrid = !HybridNames.includes(String(name));
    const notXAntibody = !["BT9-109", "EX5-070"].includes(String(cardNumber));

    if (!selectedCard && !hoverCard) return <div style={{ height: 500 }} />;

    return (
        <Wrapper inGame={inGame}>
            {(details !== DetailsView.INHERIT_OR_LINK || !inGame) && (
                <>
                    {!!name && <NameSpan isLong={isNameLong}>{name}</NameSpan>}

                    <span>
                        {digiTypes?.map((type: string, i) => (
                            <TypeSpan key={type}>
                                {i !== 0 && " | "}
                                {type}
                            </TypeSpan>
                        ))}
                    </span>

                    <Card
                        style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            gap: 2,
                            width: "calc(100% - 4px)",
                        }}
                    >
                        {!!cardType && (
                            <DetailsHeaderTooltip
                                title={
                                    <DetailsHeaderTooltipContent explanation={getDetailsHeaderTooltipTitle(cardType)} />
                                }
                            >
                                <img
                                    width={30}
                                    style={{ padding: 2 }}
                                    alt={"cardType"}
                                    src={getCardTypeImage(cardType)}
                                />
                            </DetailsHeaderTooltip>
                        )}

                        <ColorSpan />

                        {!!attribute && (
                            <DetailsHeaderTooltip
                                title={
                                    <DetailsHeaderTooltipContent
                                        explanation={getDetailsHeaderTooltipTitle(attribute)}
                                    />
                                }
                            >
                                <img
                                    width={30}
                                    style={{ padding: 2 }}
                                    alt={"attribute"}
                                    src={getAttributeImage(attribute)}
                                />
                            </DetailsHeaderTooltip>
                        )}
                    </Card>

                    <Card style={aceOverflow ? { ...aceStyle } : undefined}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                                alignItems: "center",
                            }}
                        >
                            {["Digimon", "Digi-Egg"].includes(String(cardType)) && (
                                <DetailText>
                                    Lv.
                                    <DetailMetric>{level}</DetailMetric>
                                </DetailText>
                            )}

                            {!!stage && (
                                <DetailText>
                                    {"Stage: "}
                                    <DetailMetric>{stage}</DetailMetric>
                                </DetailText>
                            )}

                            {!!dp && (
                                <DetailText>
                                    DP: <DetailMetric>{dp}</DetailMetric>
                                </DetailText>
                            )}

                            {!!aceEffect && (
                                <DetailsHeaderTooltip
                                    title={
                                        <DetailsHeaderTooltipContent
                                            explanation={getDetailsHeaderTooltipTitle("Overflow", aceOverflow)}
                                        />
                                    }
                                >
                                    <AceSpan>ACE-{aceOverflow}</AceSpan>
                                </DetailsHeaderTooltip>
                            )}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                width: "calc(100% - 4px)",
                                justifyContent: "space-between",
                                alignItems: "center",
                                paddingRight: "4px",
                            }}
                        >
                            {cardType !== "Digi-Egg" && (
                                <DetailText>
                                    {cardType === "Option" ? "Use: " : "Play: "}
                                    <DetailMetric>{playCost}</DetailMetric>
                                </DetailText>
                            )}
                            {digivolveConditions[0] && (
                                <div style={{ display: "flex", gap: 7, transform: "translateY(2px)" }}>
                                    <div>
                                        <span>{"Digivolve: "}</span>
                                        <DetailMetric>{digivolveConditions[0]?.cost}</DetailMetric>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: "12px" }}>{" from "}</span>
                                        {digivolveConditions?.map((condition, index) => (
                                            <span key={condition.color + index}>
                                                {index !== 0 && " | "}
                                                {getDnaColor(condition.color.toLowerCase())}
                                            </span>
                                        ))}
                                        {" Lv."}
                                        <DetailMetric>{digivolveConditions[0]?.level}</DetailMetric>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </>
            )}

            <EffectCardsContainer>
                {(details !== DetailsView.INHERIT_OR_LINK || !inGame) && (
                    <>
                        {dnaDigivolutionText && (
                            <EffectCard variant={EffectVariant.SPECIAL} key={`${cardNumber}_dna`}>
                                <HighlightedKeyWords text={dnaDigivolutionText} />
                            </EffectCard>
                        )}

                        {burstDigivolveText && (
                            <EffectCard variant={EffectVariant.SPECIAL} key={`${cardNumber}_burst`}>
                                <HighlightedKeyWords text={burstDigivolveText} />
                            </EffectCard>
                        )}

                        {specialDigivolveText && (
                            <EffectCard variant={EffectVariant.SPECIAL} key={`${cardNumber}_spec`}>
                                <HighlightedKeyWords text={specialDigivolveText} />
                            </EffectCard>
                        )}

                        {digiXrosText && (
                            <EffectCard variant={EffectVariant.SPECIAL} key={`${cardNumber}_xros`}>
                                <HighlightedKeyWords text={digiXrosText} />
                            </EffectCard>
                        )}

                        {assemblyEffectText && (
                            <EffectCard variant={EffectVariant.SPECIAL} key={`${cardNumber}_assembly`}>
                                <HighlightedKeyWords text={assemblyEffectText} />
                            </EffectCard>
                        )}

                        {mainEffectText && (
                            <EffectCard variant={EffectVariant.MAIN} key={`${cardNumber}_main`}>
                                <HighlightedKeyWords text={mainEffectText} />
                            </EffectCard>
                        )}

                        {linkRequirementText && (
                            <EffectCard variant={EffectVariant.LINK} key={`${cardNumber}_link`}>
                                <div style={{ display: "flex", alignItems: "center", marginBottom: "1px" }}>
                                    <div style={{ display: "flex", width: "100%", flexDirection: "column" }}>
                                        <EffectText
                                            style={{
                                                borderBottom: "1px dotted rgba(255, 255, 255, 0.35)",
                                                paddingBottom: "0.4em",
                                                marginBottom: "0.25em",
                                            }}
                                        >
                                            <HighlightedKeyWords text={linkRequirementText} />
                                        </EffectText>
                                        <EffectText>
                                            <HighlightedKeyWords text={linkEffectText} />
                                        </EffectText>
                                    </div>
                                    <div
                                        style={{
                                            display: "flex",
                                            width: "fit-content",
                                            flexDirection: "column",
                                            padding: "8px 10px 4px 10px",
                                            alignItems: "center",
                                            border: "1px solid rgba(255, 255, 255, 0.25)",
                                            borderRadius: "3px",
                                            marginBottom: "0.15em",
                                            textShadow: "0 0 2px #000000",
                                            background:
                                                "linear-gradient(to right top, rgba(47,225,172,0.4) 0%, rgba(67,245,192,0.4) 20%, rgba(67,245,192,0.3) 75%, rgba(77,255, 200,0.2) 100%)",
                                        }}
                                    >
                                        {linkDP !== 0 && (
                                            <span style={{ fontWeight: 500, fontSize: "1.1em", lineHeight: 1 }}>
                                                {"+ DP"}
                                            </span>
                                        )}
                                        {linkDP !== 0 && (
                                            <span style={{ fontFamily: "Awsumsans, sans-serif" }}>{linkDP}</span>
                                        )}
                                    </div>
                                </div>
                            </EffectCard>
                        )}

                        {ruleText && <RuleEffectCard ruleText={ruleText} key={`${cardNumber}_rule`} />}
                    </>
                )}

                {linkCardInfo.length > 0 && (
                    <LinkEffectCard linkCardInfo={linkCardInfo} key={`${cardNumber}_linkedEffect`} />
                )}

                {inheritCardInfo[0]?.length > 0 && (
                    <EffectCard
                        variant={EffectVariant.INHERITED_FROM_DIGIVOLUTION_CARDS}
                        key={`${cardNumber}_inherited`}
                    >
                        <Stack gap={1}>
                            {inheritCardInfo.map(
                                (text, index) =>
                                    !!text && (
                                        <span key={`${cardNumber}_inherited_from_material_${index}`}>
                                            <HighlightedKeyWords text={text} />
                                        </span>
                                    )
                            )}
                        </Stack>
                    </EffectCard>
                )}

                {(details !== DetailsView.INHERIT_OR_LINK || !inGame) && (
                    <>
                        {inheritedEffectText && (
                            <EffectCard
                                key={`${cardNumber}_to_inherit`}
                                variant={
                                    (cardType === "Option" && notXAntibody) || (cardType === "Tamer" && notHybrid)
                                        ? EffectVariant.SECURITY
                                        : EffectVariant.INHERITED
                                }
                            >
                                <HighlightedKeyWords text={inheritedEffectText} />
                            </EffectCard>
                        )}

                        {securityEffectText && (
                            <EffectCard variant={EffectVariant.SECURITY} key={`${cardNumber}_security`}>
                                <HighlightedKeyWords text={securityEffectText} />
                            </EffectCard>
                        )}
                    </>
                )}

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        width: "100%",
                    }}
                >
                    {(details !== DetailsView.INHERIT_OR_LINK || !inGame) && (
                        <>
                            {cardNumber && (
                                <DetailText style={{ width: "fit-content", textWrap: "nowrap" }}>
                                    {cardNumber}
                                </DetailText>
                            )}

                            <DetailText style={{ width: "fit-content", textWrap: "nowrap" }}>
                                {"✒️ "}
                                {illustrator}
                            </DetailText>
                        </>
                    )}

                    {cardNumber && (
                        <DetailText>
                            <StyledLink href={rulingsUrl} target="_blank" rel="noopener noreferrer">
                                <span>ℹ️ Rulings</span>
                            </StyledLink>
                        </DetailText>
                    )}
                </div>
            </EffectCardsContainer>
        </Wrapper>
    );
}

const Wrapper = styled.div<{ inGame: boolean }>`
    grid-area: details;
    width: ${({ inGame }) => (inGame ? "342px" : "100%")};
    height: fit-content;
    padding: 5px;
    border-radius: 5px;
    display: flex;
    flex-direction: column;
    gap: 8px;

    @supports (-moz-appearance: none) {
        scrollbar-width: thin;
    }

    ::-webkit-scrollbar {
        background: rgba(240, 240, 240, 0.1);
        width: 3px;
        border-radius: 5px;
    }
    ::-webkit-scrollbar-thumb {
        background: rgba(240, 240, 240, 0.4);
        border-radius: 5px;
    }
`;

const EffectCardsContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    overflow-y: visible;
    gap: 8px;

    @supports (-moz-appearance: none) {
        scrollbar-width: thin;
    }

    ::-webkit-scrollbar {
        background: rgba(30, 31, 16, 0.5);
        width: 5px;
    }

    ::-webkit-scrollbar-thumb {
        background: rgba(255, 239, 213, 0.75);
    }
`;

const DetailText = styled(EffectText)`
    font-size: 18px;
    line-height: 1.4rem;
    transform: translateY(0.1rem);
`;

const DetailMetric = styled.span`
    font-size: 0.95em;
    font-family: Awsumsans, sans-serif;
    color: lightcyan;
`;

const StyledLink = styled.a`
    font-weight: 500;
    color: ghostwhite;
    border: 1px solid rgba(22, 171, 255, 0.15);
    background: rgba(56, 111, 240, 0.15);
    box-shadow: inset 5px 5px 5px 5px rgba(255, 255, 255, 0.05);
    border-radius: 5px;
    padding: 3px 3px 1px 0;
    text-wrap: nowrap;
    span {
        pointer-events: none;
    }

    &:hover {
        color: ghostwhite;
        background: rgba(56, 111, 240, 0.5);
        border: 1px solid rgba(22, 171, 255, 0.25);
    }
`;

const Card = styled.div`
    width: 99.25%;
    height: 100%;
    color: ghostwhite;
    background: rgba(12, 21, 16, 0.25);
    border: 1px solid rgba(124, 124, 118, 0.4);
    border-radius: 3px;
    box-shadow: inset 5px 5px 30px 5px rgba(255, 255, 255, 0.05);
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.5));
    display: flex;
    flex-direction: column;
    z-index: 1;
`;

const AceSpan = styled.span`
    font-family: Sakana, sans-serif;
    background-image: linear-gradient(320deg, #d2d2d2, #757575);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-size: 20px;
    line-height: 1;
    filter: drop-shadow(0 0 2px #000000);
    text-shadow: none !important;
    padding-right: 6px;
`;

const aceStyle = {
    backgroundImage: `
    repeating-linear-gradient(135deg, rgba(230, 239, 255, 0) 0%, rgba(230, 239, 255, 0) 3%, rgba(230, 239, 255, 0.06) 4%),
    repeating-linear-gradient(135deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0) 2%, rgba(0, 0, 0, 0.12) 2.5%),
    repeating-linear-gradient(135deg, rgba(230, 239, 255, 0) 0%, rgba(230, 239, 255, 0) 0.6%, rgba(230, 239, 255, 0.08) 1.2%),
    linear-gradient(135deg, rgba(20, 25, 30, 1) 0%, rgba(40, 50, 60, 1) 45%, rgba(30, 38, 48, 1) 55%, rgba(15, 20, 25, 1) 100%)
  `,
    textShadow: "0 0 2px #000000",
    border: "1px solid rgba(124, 124, 118, 0.1)",
};

const NameSpan = styled.span<{ isLong: boolean }>`
    display: inline-block;
    font-family:
        League Spartan,
        sans-serif;
    font-weight: 400;
    font-size: ${({ isLong }) => (isLong ? "1.25rem" : "1.8rem")};
    line-height: 0.7;
    color: ghostwhite;
`;

const TypeSpan = styled.span`
    font-weight: 300;
    font-size: 1.25rem;
    display: inline-block;
    font-family:
        League Spartan,
        sans-serif;
    line-height: 1;
    color: whitesmoke;
`;

const DetailsHeaderTooltip = muiStyled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
))(() => ({
    [`& .${tooltipClasses.arrow}`]: { color: indigo[500] },
    [`& .${tooltipClasses.tooltip}`]: { backgroundColor: indigo[500] },
}));

function DetailsHeaderTooltipContent({ explanation }: { explanation: string }) {
    return <span style={{ fontFamily: "League Spartan", color: "ghostwhite", fontSize: "1.2rem" }}>{explanation}</span>;
}

function getDetailsHeaderTooltipTitle(keyword: string, overflow?: string | null) {
    if (keyword === "Overflow") {
        return `As this card moves from the battle area or under a card to another area, lose ${overflow} memory.`;
    } else return keyword;
}

function getDnaColor(word: string): string {
    switch (word) {
        case "red":
            return "🔴";
        case "yellow":
            return "🟡";
        case "green":
            return "🟢";
        case "blue":
            return "🔵";
        case "purple":
            return "🟣";
        case "black":
            return "⚫";
        case "white":
            return "⚪";
        case "all":
            return "ALL 🌈";
        default:
            return word + " ";
    }
}
