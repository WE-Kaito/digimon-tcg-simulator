import GameBackground from "../components/game/GameBackground.tsx";
import styled from "@emotion/styled";
import {Stack, useMediaQuery} from "@mui/material";
import carbackSrc from "../assets/cardBack.jpg";
import {useEffect, useRef, useState} from "react";
import PlayerBoardSide from "../components/game/PlayerBoardSide/PlayerBoardSide.tsx";
import {useStore} from "../hooks/useStore.ts";
import CardDetails from "../components/cardDetails/CardDetails.tsx";
import {useContextMenu} from "react-contexify";
import SoundBar from "../components/SoundBar.tsx";

const mediaQueries = [
    '(orientation: landscape) and (-webkit-min-device-pixel-ratio: 2) and (pointer: coarse)',
    '(orientation: landscape) and (min-resolution: 192dpi) and (pointer: coarse)',
    '(orientation: landscape) and (min-resolution: 2dppx) and (pointer: coarse)',
    '(max-height: 700px)',
    '(orientation: portrait) and (max-width: 1300px)'
].join(',');

export default function GamePage() {
    const selectCard = useStore((state) => state.selectCard);
    const selectedCard = useStore((state) => state.selectedCard);
    const hoverCard = useStore((state) => state.hoverCard);

    const {show: showDetailsImageMenu} = useContextMenu({id: "detailsImageMenu"});

    const isMobile = useMediaQuery(mediaQueries);
    const isPortrait = useMediaQuery('(orientation: portrait)');

    const boardContainerRef = useRef<HTMLDivElement>(null);
    const [boardMaxWidth, setBoardMaxWidth] = useState('unset');

    function calculateMaxWidth() {
        const container = boardContainerRef.current;
        if (container) {
            const { clientHeight: height, clientWidth: width } = container;
            const calculatedMaxWidth = width > height * (19 / 9) ? `${height * (19 / 9)}px` : 'unset';
            setBoardMaxWidth(calculatedMaxWidth);
        }
    }

    useEffect(() => boardContainerRef.current?.scrollTo(boardContainerRef.current?.scrollWidth / 3, 0), [isMobile]);
    useEffect(() => window.scrollTo(0, 0), [isPortrait]);
    useEffect(() => calculateMaxWidth(), [boardContainerRef]);

    return (
        <>
            <GameBackground/>

            <>
            {/* Komponente: auslagern von Context Menus und co. */}
            </>
            <Stack width={"100vw"} maxHeight={isMobile ? "unset" : "100%"} sx={{ containerType: "inline-size" }}>
                <TopStack isMobile={isMobile}>
                    {isMobile && <div style={{background: "darkolivegreen", width: 500, height: 80, maxWidth: "100vw" }}>Settings</div>}
                    <div style={{ background: "darkolivegreen", width: 500, justifySelf: "flex-start", alignSelf: "flex-start", maxWidth: "100vw", height: 80 }}>Nameplate ME</div>
                    <div style={{background: "darkolivegreen", width: 500, height: 80, maxWidth: "100vw" }}>Nameplate Opponent</div>
                </TopStack>

                <MainStack isMobile={isMobile}>
                    <DetailsContainer isMobile={isMobile}>
                        {isMobile && <MobileCardImg src={hoverCard?.imgUrl ?? selectedCard?.imgUrl ?? carbackSrc} style={{ height: 450}}
                                        alt={"cardImg"}/>}
                        <CardDetails/>
                    </DetailsContainer>
                    <BoardContainer ref={boardContainerRef} isMobile={isMobile}>
                        <BoardLayout isMobile={isMobile} maxWidth={boardMaxWidth}>
                            {/* Opponent Side: */}
                            <div style={{ background: "blueviolet", gridColumn: "1 / -1", gridRow: "1 / 7" }}/>
                            {/* Memory Bar: */}
                            <div style={{ background: "yellow", gridColumn: "4 / 26", gridRow: "7 / 9" }}/>
                            {/* Phase Button: */}
                            <div style={{ background: "orange", gridColumn: "27 / 33", gridRow: "7 / 9" }}/>
                            {/* My Side: */}
                            <PlayerBoardSide />
                        </BoardLayout>
                    </BoardContainer>
                </MainStack>

                <BottomStack isMobile={isMobile}>
                    {!isMobile && <ImgContainer>
                        <DesktopCardImg src={hoverCard?.imgUrl ?? selectedCard?.imgUrl ?? carbackSrc} alt={"cardImg"}
                                        onContextMenu={(e) => showDetailsImageMenu({event: e})}
                                        onClick={() => selectCard(null)}
                                        style={{ pointerEvents: !(selectedCard || hoverCard) ? "none" : "unset"}}/>
                    </ImgContainer>
                    }
                    {!isMobile && <SettingsContainer>
                        <SoundBar/>
                    </SettingsContainer>}
                    <LogContainer isMobile={isMobile}>Log</LogContainer>
                    <ChatContainer isMobile={isMobile}>Chat</ChatContainer>
                </BottomStack>
            </Stack>
        </>
    );
}

const TopStack = styled.div<{ isMobile: boolean }>`
  order: ${({isMobile}) => isMobile ? 3 : 1};
  display: flex;
  width: 100vw;
  justify-content: ${({isMobile}) => isMobile ? "center" : "space-between"};
  flex-wrap: ${({isMobile}) => isMobile ? "wrap-reverse" : "wrap"};
`;

const MainStack = styled.div<{ isMobile: boolean }>`
  order: ${({isMobile}) => isMobile ? 1 : 2};
  display: flex;
  width: 100vw;
  max-height: ${({isMobile}) => isMobile ? "unset" : "calc(100vh - 230px)"};
  justify-content: space-evenly;
  flex-direction: ${({isMobile}) => isMobile ? "column" : "row"};
`;

const BottomStack = styled.div<{ isMobile: boolean }>`
  order: ${({isMobile}) => isMobile ? 2 : 3};
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  height: ${({isMobile}) => isMobile ? "fit-content" : "150px"};
;`

const DetailsContainer = styled.div<{ isMobile: boolean }>`
  display: flex;
  max-height: ${({isMobile}) => isMobile ? "fit-content" : "calc(100vh - 230px)"};
  min-width: 402px;
  flex-direction: ${({isMobile}) => isMobile ? "row" : "column"};
  justify-content: ${({isMobile}) => isMobile ? "center" : "flex-start"};
  align-items: center;
  flex-wrap: ${({isMobile}) => isMobile ? "wrap" : "unset"};
  order: ${({isMobile}) => isMobile ? 2 : "unset"};
  gap: 5px;
  padding-top: 5px;
`;

const MobileCardImg = styled.img`
  border-radius: 3.5%;
  aspect-ratio: 5 / 7;
  max-width: calc(100vw - 420px);
  max-height: calc(100vw - (420px * 5 / 7));
  
  @media (max-width: 500px) {
    max-width: 98vw;
    max-height: unset;
    padding: 5px;
  }
`;

const ImgContainer = styled.div`
  border-radius: 3.5%;
  height: 150px;
  width: 107px; // 150 * (5/7)
  position: relative;
`;

const DesktopCardImg = styled.img`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  
  border-radius: 3.5%;
  aspect-ratio: 5 / 7;
  width: 107px; // 150 * (5/7)
  
  &:hover {
    z-index: 1000;
    width: 400px;
    top: unset;
    left: 0;
    bottom: 0;
    transform: unset;
  }
`;

const BoardContainer = styled.div<{ isMobile: boolean }>`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 450px;
  width: ${({isMobile}) => isMobile ? "unset" : "calc(100vw - 400px)"}; // 400px = Details width, may change
  height: ${({isMobile}) => isMobile ? "fit-content" : "calc(100vh - 230px)"};
  
  container-type: inline-size;
  container-name: board-container;
  overflow-x: scroll;
  overflow-y: hidden;
  scrollbar-width: none;
  
  @media (max-width: 1300px) {
    display: block;
    border-radius: 0;
    scrollbar-width: thin;
  }
  @media (max-height: 499px) {
    min-height: 100vh;
    max-height: 100vh;
  }
`;

const BoardLayout = styled.div<{ isMobile: boolean, maxWidth: string }>`
  aspect-ratio: 19 / 9;
  width: ${({isMobile}) => isMobile ? "unset" : "100%"};
  max-width: ${({maxWidth}) => maxWidth};
  min-height: ${({isMobile}) => isMobile ? "450px" : "unset"};
  max-height: 100%;
  
  background: rgba(47, 45, 45, 0.45);
  border-radius: 15px;
  padding: 5px;
  
  display: grid;
  grid-template-columns: repeat(35, 1fr);
  grid-template-rows: repeat(14, 1fr);

  @container board-container (max-width: 900px) {
    width: unset;
    height: 100%;
    border-radius: unset;
  }
  @media (max-height: 499px) {
    min-height: 100vh;
    max-height: 100vh;
  }
`;

const SettingsContainer = styled.div`
  height: fit-content;
  max-height: 100%;
  width: 320px;
`;

const ChatContainer = styled.div<{ isMobile: boolean }>`
  order: ${({isMobile}) => isMobile ? 1 : 2};
  background: darkgoldenrod;
  min-width: 400px;
  width: ${({isMobile}) => isMobile ? "100%" : "calc(100% - 827px)"}; // 900px = Log + Settings, may change
  height: ${({isMobile}) => isMobile ? "200px" : "150px"};
  contain: size;
`;

const LogContainer = styled.div<{ isMobile: boolean }>`
  order: ${({isMobile}) => isMobile ? 2 : 1};
  background: darkorchid;
  width: ${({isMobile}) => isMobile ? "100%" : "400px"};
  height: ${({isMobile}) => isMobile ? "200px" : "150px"};
`;
