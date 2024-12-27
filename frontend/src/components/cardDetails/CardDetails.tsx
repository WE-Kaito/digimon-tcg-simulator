import styled from "@emotion/styled";
import {useGeneralStates} from "../../hooks/useGeneralStates.ts";
import HighlightedKeyWords from "./HighlightedKeyWords.tsx";
import {useState} from "react";
import {Tabs, TabList, Tab, TabPanel} from '@zendeskgarden/react-tabs';
import DetailsHeader from "./DetailsHeader.tsx";
import EffectCard, {EffectText} from "./EffectCard.tsx";
import {Stack} from "@mui/material";
import {getDnaColor} from "../../utils/functions.ts";
import {CardTypeGame, CardTypeWithId} from "../../utils/types.ts";
import {useLocation} from "react-router-dom";
import {useGameBoardStates} from "../../hooks/useGameBoardStates.ts";
import {EffectVariant} from "./constants.ts";

const HybridNames = ["Takuya Kanbara", "Koji Minamoto", "Koichi Kimura", "Tommy Himi", "Zoe Orimoto", "J.P. Shibayama",
                "Satsuki Tamahime", "Eiji Nagasumi", "Marvin Jackson", "Xu Yulin", "Hacker Judge", "Kosuke Kisakata"];

export default function CardDetails({isMobile} : {isMobile?: boolean}) {

    const location = useLocation();
    const inGame = location.pathname === "/game";

    const selectedCard : CardTypeWithId | CardTypeGame | null = useGeneralStates((state) => state.selectedCard);
    const hoverCard : CardTypeWithId | CardTypeGame | null  = useGeneralStates((state) => state.hoverCard);
    const inheritCardInfo = useGameBoardStates((state) => state.inheritCardInfo);

    const [selectedTab, setSelectedTab] = useState("effects");

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


    const notHybrid =!HybridNames.includes(String(name));
    const notXAntibody = !["BT9-109", "EX5-070"].includes(String(cardNumber));

    if (!selectedCard && !hoverCard) return <div style={{height: 500}}/>;

    if (isMobile) return (
        inheritCardInfo[0]?.length > 0 &&
        <div style={{maxWidth: 500}}>
            <EffectCard variant={EffectVariant.INHERITED_FROM_DIGIVOLUTION_CARDS} key={`${cardNumber}_inherited`}>
                <Stack gap={1}>
                    {inheritCardInfo.map((text, index) => !!text &&
                        <span key={`${cardNumber}_inherited_from_material_${index}`}>
                                            <HighlightedKeyWords text={text}/>
                                        </span>
                    )}
                </Stack>
            </EffectCard>
        </div>
    );

    return (
        <Wrapper inGame={inGame}>

            <DetailsHeader/>

            <Tabs selectedItem={selectedTab} style={{position: "relative"}} onChange={setSelectedTab}>
                <TabList style={{marginBottom: 0, containerType: "inline-size", containerName: "tabs"}}>
                    <StyledTab selectedTab={selectedTab} item="effects">
                        <TabLabel1 tab="effects">Effects</TabLabel1>
                    </StyledTab>
                    <StyledTab selectedTab={selectedTab} item="details">
                        <TabLabel2 tab="details">Details</TabLabel2>
                    </StyledTab>
                </TabList>

                <TabPanel item="effects" style={{ height: "100%" }}>
                    <TabContainer>

                        {dnaDigivolutionText && <EffectCard variant={EffectVariant.SPECIAL} key={`${cardNumber}_dna`}>
                            <HighlightedKeyWords text={dnaDigivolutionText}/>
                        </EffectCard>}

                        {digiXrosText && <EffectCard variant={EffectVariant.SPECIAL} key={`${cardNumber}_xros`}>
                            <HighlightedKeyWords text={digiXrosText}/>
                        </EffectCard>}

                        {burstDigivolveText && <EffectCard variant={EffectVariant.SPECIAL} key={`${cardNumber}_burst`}>
                            <HighlightedKeyWords text={burstDigivolveText}/>
                        </EffectCard>}

                        {specialDigivolveText && <EffectCard variant={EffectVariant.SPECIAL} key={`${cardNumber}_spec`}>
                            <HighlightedKeyWords text={specialDigivolveText}/>
                        </EffectCard>}

                        {mainEffectText && <EffectCard variant={EffectVariant.MAIN} key={`${cardNumber}_main`}>
                            <HighlightedKeyWords text={mainEffectText}/>
                        </EffectCard>}

                        {inheritCardInfo[0]?.length > 0 && <EffectCard variant={EffectVariant.INHERITED_FROM_DIGIVOLUTION_CARDS} key={`${cardNumber}_inherited`}>
                            <Stack gap={1}>
                                {inheritCardInfo.map((text, index) => !!text &&
                                    <span key={`${cardNumber}_inherited_from_material_${index}`}>
                                        <HighlightedKeyWords text={text}/>
                                    </span>
                                )}
                            </Stack>
                        </EffectCard>}

                        {inheritedEffectText && <EffectCard key={`${cardNumber}_to_inherit`}
                            variant={((cardType === "Option" && notXAntibody)|| (cardType === "Tamer" && notHybrid)) ? EffectVariant.SECURITY : EffectVariant.INHERITED}>
                            <HighlightedKeyWords text={inheritedEffectText}/>
                        </EffectCard>}

                        {securityEffectText && <EffectCard variant={EffectVariant.SECURITY} key={`${cardNumber}_security`}>
                            <HighlightedKeyWords text={securityEffectText}/>
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
                                        <span key={condition.color + index}>
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

const Wrapper = styled.div<{inGame: boolean}>`
  width: ${({inGame}) => inGame ? "392px" : "100%"};
  height: fit-content;
  padding: 5px;
  border-radius: 5px;
  grid-area: details;
  overflow-y: ${({inGame}) => inGame ? "unset" : "scroll"};
  container-type: inline-size;
  container-name: details-container;

  @supports (-moz-appearance:none) {
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

const StyledTab = styled(Tab)<{ item: string, selectedTab: string }>`
  margin: 0;
  padding: 0;
  width: 39%;
  height: 0.5rem;
  position: relative;
  border: none !important;
  color: ${({item, selectedTab}) => item === selectedTab ? "black" : "whitesmoke"} !important;
  background-color: ${({item, selectedTab}) => item === selectedTab ? "whitesmoke" : "rgba(0, 0, 0, 0)"};
  border-top-right-radius: ${({item}) => item === "effects" ? "25px" : "5px"};
  border-top-left-radius: ${({item}) => item === "details" ? "25px" : "5px"};
  transition: all 0.2s ease-in-out !important;

  @container tabs (min-width: 521px) and (max-width: 535px) { width: 39.25%; }
  @container tabs (min-width: 501px) and (max-width: 520px) { width: 39%; }
  @container tabs (min-width: 486px) and (max-width: 500px) { width: 38.75%; }
  @container tabs (min-width: 471px) and (max-width: 485px) { width: 38%; }
  @container tabs (min-width: 451px) and (max-width: 470px) { width: 37.75%; }
  @container tabs (min-width: 441px) and (max-width: 450px) { width: 37.50%; }
  @container tabs (min-width: 431px) and (max-width: 441px) { width: 37.25%; }
  @container tabs (min-width: 421px) and (max-width: 430px) { width: 36.75%; }
  @container tabs (min-width: 411px) and (max-width: 420px) { width: 36.5%; }
  @container tabs (min-width: 401px) and (max-width: 410px) { width: 35%; }
  @container tabs (min-width: 381px) and (max-width: 400px) { width: 34.75%; }
  @container tabs (min-width: 371px) and (max-width: 380px) { width: 34.5%; }
  @container tabs (min-width: 361px) and (max-width: 370px) { width: 34.25%; }
  @container tabs (min-width: 351px) and (max-width: 360px) { width: 34%; }
  @container tabs (max-width: 350px) { width: 32.5%; }
  
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

const TabContainer = styled.div`
  width: 100%;
  max-height: calc(100vh - 392px);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  overflow-y: auto;
  padding: 5px 1px 5px 0;
  gap: 6px;

  @supports (-moz-appearance:none) {
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

const TabContainer2 = styled.div<{ inGame : boolean }>`
  width: 100%;
  height: ${({inGame}) => inGame ? "372px" : "251px"};
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
