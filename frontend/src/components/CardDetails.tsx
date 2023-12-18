import styled from "@emotion/styled";
import {useStore} from "../hooks/useStore.ts";
import HighlightedKeyWords from "./cardDetails/HighlightedKeyWords.tsx";
import {useEffect, useState} from "react";

import {Tabs, TabList, Tab, TabPanel} from '@zendeskgarden/react-tabs';
import DetailsHeader from "./cardDetails/DetailsHeader.tsx";
import EffectCard, {EffectText} from "./cardDetails/EffectCard.tsx";
import {Stack} from "@mui/material";
import {getDnaColor} from "../utils/functions.ts";
import {CardTypeGame, CardTypeWithId} from "../utils/types.ts";
import {useLocation} from "react-router-dom";

const HybridNames = ["Takuya Kanbara", "Koji Minamoto", "Koichi Kimura", "Tommy Himi", "Zoe Orimoto", "J.P. Shibayama"];

export default function CardDetails() {

    const location = useLocation();
    const inGame = location.pathname === "/game";

    const selectedCard : CardTypeWithId | CardTypeGame | null = useStore((state) => state.selectedCard);
    const hoverCard : CardTypeWithId | CardTypeGame | null  = useStore((state) => state.hoverCard);

    // First Tab
    const name = hoverCard?.name ?? selectedCard?.name;
    const cardType = hoverCard?.cardType ?? selectedCard?.cardType;
    const mainEffectText = hoverCard?.mainEffect ?? (!hoverCard ? (selectedCard?.mainEffect ?? "") : "");
    const inheritedEffectText = hoverCard?.inheritedEffect ?? (!hoverCard ? (selectedCard?.inheritedEffect ?? "") : "");
    const securityEffectText = hoverCard?.securityEffect ?? (!hoverCard ? (selectedCard?.securityEffect ?? "") : "");
    const specialDigivolveText = hoverCard?.specialDigivolve ?? (!hoverCard ? (selectedCard?.specialDigivolve ?? "") : "");
    const burstDigivolveText = hoverCard?.burstDigivolve ?? (!hoverCard ? (selectedCard?.burstDigivolve ?? "") : "");
    const digiXrosText = hoverCard?.digiXros ?? (!hoverCard ? (selectedCard?.digiXros ?? "") : "");
    const dnaDigivolutionText = hoverCard?.dnaDigivolve ?? (!hoverCard ? (selectedCard?.dnaDigivolve ?? "") : "");

    // Second Tab
    const cardNumber = hoverCard?.cardNumber ?? selectedCard?.cardNumber;
    const level = hoverCard?.level ?? (!hoverCard ? (selectedCard?.level ?? 0) : 0);
    const playCost = hoverCard?.playCost ?? (!hoverCard ? (selectedCard?.playCost ?? 0) : 0);
    const digivolveConditions = hoverCard?.digivolveConditions ?? (!hoverCard ? (selectedCard?.digivolveConditions ?? []) : []);
    const dp = hoverCard?.dp ?? (!hoverCard ? (selectedCard?.dp ?? 0) : 0);
    const stage = hoverCard?.stage ?? (!hoverCard ? (selectedCard?.stage ?? "") : "");
    const illustrator = hoverCard?.illustrator ?? (!hoverCard ? (selectedCard?.illustrator ?? "") : "");
    const rulingsUrl = `https://digimoncardgame.fandom.com/wiki/${cardNumber}/Rulings`;

    const [highlightedMainEffect, setHighlightedMainEffect] = useState<(JSX.Element | JSX.Element[])[]>([]);
    const [highlightedInheritedEffect, setHighlightedInheritedEffect] = useState<(JSX.Element | JSX.Element[])[]>([]);
    const [highlightedSecurityEffect, sethighlightedSecurityEffect] = useState<(JSX.Element | JSX.Element[])[]>([]);
    const [highlightedSpecialDigivolve, setHighlightedSpecialDigivolve] = useState<(JSX.Element | JSX.Element[])[]>([]);
    const [highlightedBurstDigivolve, setHighlightedBurstDigivolve] = useState<(JSX.Element | JSX.Element[])[]>([]);
    const [highlightedDigiXros, setHighightedDigiXros] = useState<(JSX.Element | JSX.Element[])[]>([]);
    const [highlightedDNADigivolution, setHighlightedDNADigivolution] = useState<(JSX.Element | JSX.Element[])[]>([]);
    const [selectedTab, setSelectedTab] = useState("effects");

    useEffect(() => {
        setHighlightedMainEffect(HighlightedKeyWords({text: mainEffectText}));
        setHighlightedInheritedEffect(HighlightedKeyWords({text: inheritedEffectText}));
        sethighlightedSecurityEffect(HighlightedKeyWords({text: securityEffectText}));
        setHighlightedSpecialDigivolve(HighlightedKeyWords({text: specialDigivolveText}));
        setHighlightedBurstDigivolve(HighlightedKeyWords({text: burstDigivolveText}));
        setHighightedDigiXros(HighlightedKeyWords({text: digiXrosText}));
        setHighlightedDNADigivolution(HighlightedKeyWords({text: dnaDigivolutionText}));

        setHighlightedSpecialDigivolve((prev): (JSX.Element | JSX.Element[])[] => {
            prev.shift();
            return prev
        });
        setHighlightedBurstDigivolve((prev): (JSX.Element | JSX.Element[])[] => {
            prev.shift();
            return prev
        });
        setHighightedDigiXros((prev): (JSX.Element | JSX.Element[])[] => {
            prev.shift();
            return prev
        });
        setHighlightedDNADigivolution((prev): (JSX.Element | JSX.Element[])[] => {
            prev.shift();
            return prev
        });
        // sethighlightedSecurityEffect(highlightKeyWords({text: securityEffectText}));
    }, [selectedCard, hoverCard]);

    if (!selectedCard && !hoverCard) return <div style={{height: "100%"}}/>;
    return (
        <Wrapper>

            <DetailsHeader/>

            <Tabs selectedItem={selectedTab} style={{position: "relative"}} onChange={setSelectedTab}>
                <TabList style={{marginBottom: 0}}>
                    <StyledTab selectedTab={selectedTab} item="effects">
                        <TabLabel1 tab="effects">Effects</TabLabel1>
                    </StyledTab>
                    <StyledTab selectedTab={selectedTab} item="details">
                        <TabLabel2 tab="details">Details</TabLabel2>
                    </StyledTab>
                </TabList>

                <TabPanel item="effects">
                    <TabContainer inGame={inGame}>

                        {dnaDigivolutionText && <EffectCard variant={"DNA Digivolution"}>
                            {highlightedDNADigivolution}
                        </EffectCard>}

                        {digiXrosText && <EffectCard variant={"DigiXros"}>
                            {highlightedDigiXros}
                        </EffectCard>}

                        {burstDigivolveText && <EffectCard variant={"Burst Digivolve"}>
                            {highlightedBurstDigivolve}
                        </EffectCard>}

                        {specialDigivolveText && <EffectCard variant={cardType === "Option" ? "security" : "Digivolve"}>
                            {highlightedSpecialDigivolve}
                        </EffectCard>}

                        {mainEffectText && <EffectCard variant={"main"}>
                            {highlightedMainEffect}
                        </EffectCard>}

                        {inheritedEffectText && <EffectCard
                            variant={(cardType === "Option" || (cardType === "Tamer" && !HybridNames.includes(String(name)))) ? "security" : "inherited"}>
                            {highlightedInheritedEffect}
                        </EffectCard>}

                        {securityEffectText && <EffectCard variant={"security"}>
                            {highlightedSecurityEffect}
                        </EffectCard>}
                    </TabContainer>
                </TabPanel>

                <TabPanel item="details">

                    <TabContainer2 inGame={inGame}>
                        <Stack spacing={2} width={"98.5%"} direction={"row"} sx={{marginRight: 10}}>
                            <DetailCard>
                                <DetailText>
                                    <DetailMetric>{cardNumber}</DetailMetric>
                                </DetailText>
                            </DetailCard>

                            {["Digimon", "Digi-Egg"].includes(String(cardType)) && <DetailCard>
                                <DetailText>
                                    Lv.
                                    <DetailMetric>{level}</DetailMetric>
                                </DetailText>
                            </DetailCard>}

                            {cardType !== "Digi-Egg" && <DetailCard>
                                <DetailText>
                                    {cardType === "Option" ? "Cost: " : "Play: "}
                                    <DetailMetric>{playCost}</DetailMetric>
                                </DetailText>
                            </DetailCard>}
                        </Stack>

                        {digivolveConditions[0] && <DetailCard>
                            <DetailText style={{display: "flex", width: "97%", justifyContent: "space-between"}}>
                                <div>
                                <span>{"Digivolve Cost: "}</span>
                                <DetailMetric>{digivolveConditions[0]?.cost}</DetailMetric>
                                </div>
                                <div>
                                    <span style={{fontSize: "0.7em"}}>{" from "}</span>
                                    {digivolveConditions?.map((condition, index) =>
                                        <span key={condition.color}>
                                        {(index !== 0) && " | "}
                                            {getDnaColor(condition.color.toLowerCase())}
                                    </span>)}
                                    {" Lv."}
                                    <DetailMetric>{digivolveConditions[0]?.level}</DetailMetric>
                                </div>
                            </DetailText>
                        </DetailCard>}

                        <div style={{
                            display: "grid",
                            gridTemplateColumns: (!dp && stage) ? "1fr 1fr" : "1fr 2fr",
                            gap: 15,
                            width: "98.5%"
                        }}>
                            {!!dp && <DetailCard>
                                <DetailText>
                                    DP: <DetailMetric>{dp}</DetailMetric>
                                </DetailText>
                            </DetailCard>}

                            {!!stage && <DetailCard>
                                <DetailText>
                                    {"Stage: "}
                                    <DetailMetric>{stage}</DetailMetric>
                                </DetailText>
                            </DetailCard>}
                        </div>

                        <DetailCard>
                            <DetailText>
                                {"Illustrator: "}
                                <DetailMetric>{illustrator}</DetailMetric>
                            </DetailText>
                        </DetailCard>

                        <DetailText>
                            <StyledLink href={rulingsUrl}  target="_blank" rel="noopener noreferrer">
                                🛈 Rulings
                            </StyledLink>
                        </DetailText>

                    </TabContainer2>

                </TabPanel>
            </Tabs>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 5px;
  border-radius: 5px;
`;

const StyledTab = styled(Tab)<{ item: string, selectedTab: string }>`
  margin: 0;
  padding: 0;
  width: 38.75%;
  height: 0.5rem;
  position: relative;
  border: none !important;
  color: ${({item, selectedTab}) => item === selectedTab ? "black" : "whitesmoke"} !important;
  background-color: ${({item, selectedTab}) => item === selectedTab ? "whitesmoke" : "rgba(0, 0, 0, 0)"};
  border-top-right-radius: ${({item}) => item === "effects" ? "25px" : "5px"};
  border-top-left-radius: ${({item}) => item === "details" ? "25px" : "5px"};
  transition: all 0.2s ease-in-out !important;

  &:hover {
    span {
      color: #156cd0;
    }
  }
`;

const TabLabel1 = styled.span<{ tab: string }>`
  position: absolute;
  top: 0.1rem;
  font-size: 1rem;
  font-family: Verdana, sans-serif;
  font-weight: 600;

  left: 5px;
`;

const TabLabel2 = styled(TabLabel1)`
  left: unset;
  right: 5px;
`;

const TabContainer = styled.div<{ inGame : boolean }>`
  width: 100%;
  height: ${({inGame}) => inGame ? "100%" : "251px"};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow-y: scroll;
  scrollbar-width: thin;
  padding: 5px 0 5px 0;
  gap: 6px;

  ::-webkit-scrollbar {
    width: 5px;
  }

  ::-webkit-scrollbar-thumb {
    background: rgba(250, 250, 250, 0.65);
  }
`;

const TabContainer2 = styled.div<{ inGame : boolean }>`
  width: 100%;
  height: ${({inGame}) => inGame ? "100%" : "251px"};
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 5px;
  gap: 15px;
`;

const DetailCard = styled.div`
  width: 98.5%;
  background: #0c0c0c;
  filter: drop-shadow(0 0 1px ghostwhite);
`;

const DetailText = styled(EffectText)`
  font-size: 1.5rem;
  line-height: 1.4rem;
  transform: translateY(0.1rem);
`;

const DetailMetric = styled.span`
  font-size: 0.95em;
  font-family: Awsumsans, sans-serif;
  color: lightcyan;
`;

const StyledLink = styled.a`
  font-weight: 400;
  color: lightcyan;
    &:hover {
        color: #14d591;
    }
`;
