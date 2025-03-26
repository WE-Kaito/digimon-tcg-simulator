import styled from "@emotion/styled";
import {useGeneralStates} from "../hooks/useGeneralStates.ts";
import {Fragment, useCallback, useEffect, useState} from "react";
import BackButton from "../components/BackButton.tsx";
import {Headline2} from "../components/Header.tsx";
import ChooseAvatar from "../components/profile/ChooseAvatar.tsx";
import {Loading} from "../components/deckbuilder/FetchedCards.tsx";
import UserSettings from "../components/profile/UserSettings.tsx";
import SortableProfileDeck from "../components/profile/SortableProfileDeck.tsx";
import {closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors} from "@dnd-kit/core";
import {arrayMove, SortableContext} from "@dnd-kit/sortable";
import {DeckType} from "../utils/types.ts";
import ChooseCardSleeve from "../components/profile/ChooseCardSleeve.tsx";
import {Stack} from "@mui/material";
import ChooseDeckImage from "../components/profile/ChooseDeckImage.tsx";
import CustomDialogTitle from "../components/profile/CustomDialogTitle.tsx";
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import {useNavigate} from "react-router-dom";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import MenuDialog from "../components/MenuDialog.tsx";

export type DeckIdOrder = string[];

export default function Profile() {
    const user = useGeneralStates((state) => state.user);
    const loadOrderedDecks = useGeneralStates((state) => state.loadOrderedDecks);
    const deckIdOrder = useGeneralStates((state) => state.deckIdOrder);
    const setDeckIdOrder = useGeneralStates((state) => state.setDeckIdOrder);
    const isLoading = useGeneralStates((state) => state.isLoading);
    const clearDeck = useGeneralStates((state) => state.clearDeck);

    const [renderAddButton, setRenderAddButton] = useState(false);
    const [orderedDecks, setOrderedDecks] = useState<DeckType[]>([]);
    const [sleeveSelectionOpen, setSleeveSelectionOpen] = useState(false);
    const [imageSelectionOpen, setImageSelectionOpen] = useState(false);

    const navigate = useNavigate();
    const sensors = useSensors(useSensor(PointerSensor));

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;

        if (!!over && (active.id !== over.id)) {
            const oldIndexId = deckIdOrder.findIndex((id) => id === active.id);
            const newIndexId = deckIdOrder.findIndex((id) => id === over.id);
            setDeckIdOrder(arrayMove(deckIdOrder, oldIndexId, newIndexId), setOrderedDecks);
        }
    }

    function handleOnClose() {
        setSleeveSelectionOpen(false);
        setImageSelectionOpen(false);
        loadOrderedDecks(setOrderedDecks)
    }

    function toDeckBuilder() {
        navigate("/deckbuilder");
        clearDeck();
    }

    const stableLoadOrderedDecks = useCallback(() => loadOrderedDecks(setOrderedDecks), [loadOrderedDecks]);
    useEffect(() => stableLoadOrderedDecks(), [stableLoadOrderedDecks]);

    useEffect(() => {
        if (!isLoading && !orderedDecks.length) setRenderAddButton(true);
    }, [isLoading, orderedDecks.length]);

    return (
        <MenuBackgroundWrapper>
            <Stack minHeight={"100vh"} height={"100%"} pt={"20px"} justifyContent={"flex-start"}>
                <Header>
                    <Name>{user}</Name>
                    <BackButton/>
                </Header>

                <UserSettings/>

                <MenuDialog onClose={handleOnClose} open={sleeveSelectionOpen} PaperProps={{sx: {overflow: "hidden"}}}>
                    <CustomDialogTitle handleOnClose={handleOnClose} variant={"Sleeve"}/>
                    <ChooseCardSleeve/>
                </MenuDialog>

                <MenuDialog onClose={handleOnClose} open={imageSelectionOpen}>
                    <CustomDialogTitle handleOnClose={handleOnClose} variant={"Image"}/>
                    <ChooseDeckImage/>
                </MenuDialog>

                <ChooseAvatar/>

                <DeckHeaderContainer>
                    <span>Decks</span>
                    <hr style={{width: "100vw", maxWidth: 1204}}/>
                </DeckHeaderContainer>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <Container>
                        {isLoading
                            ? <Loading/>
                            : <>
                                <SortableContext items={orderedDecks}>
                                    {orderedDecks?.map((deck, index) =>
                                        <Fragment key={deck.id}>
                                            <SortableProfileDeck deck={deck}
                                                                 setSleeveSelectionOpen={setSleeveSelectionOpen}
                                                                 setImageSelectionOpen={setImageSelectionOpen}
                                            />
                                            {(index === orderedDecks.length - 1) && orderedDecks.length < 16 &&
                                                <NewDeckButton onClick={toDeckBuilder}>
                                                    <AddBoxRoundedIcon/>
                                                </NewDeckButton>
                                            }
                                        </Fragment>
                                    )}
                                </SortableContext>
                                {renderAddButton &&
                                    <NewDeckButton onClick={toDeckBuilder}>
                                        <AddBoxRoundedIcon/>
                                    </NewDeckButton>
                                }
                            </>
                        }
                    </Container>
                </DndContext>
            </Stack>
        </MenuBackgroundWrapper>
    );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
  background: rgba(0, 0, 0, 0);
  scrollbar-width: none;
  max-width: 1204px;

  ::-webkit-scrollbar {
    visibility: hidden;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  width: 1040px;
  @media (max-width: 1000px) {
    width: 96.5vw;
  }
`;

const Name = styled(Headline2)`
  font-family: 'Amiga Forever Pro2', sans-serif;
`;

const DeckHeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  width: 100vw;
  max-width: 1204px;
  margin-top: 20px;

  span {
    color: #1d7dfc;
    line-height: 1;
    font-family: Naston, sans-serif;
    font-size: 22px;
    @media (max-width: 1050px) {
      font-size: 17px;
      padding-left: 5px;
    }
  }

  hr {
    color: #1d7dfc;
    width: 100%;
    background: #1d7dfc;
    height: 2px;
    border-radius: 3px;
    margin-top: 0;
  }
`;

const NewDeckButton = styled.div`
  cursor: pointer;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 12px;
  height: 180px;
  width: 280px;
  background: linear-gradient(20deg, rgba(87, 171, 255, 0.06) 0%, rgba(93, 159, 236, 0.06) 70%, rgba(94, 187, 245, 0.16) 100%);
  padding: 3px;
  box-shadow: inset 0 0 3px 0 rgba(148, 224, 255, 0.4);

  &:hover {
    background: linear-gradient(20deg, rgba(87, 171, 255, 0.12) 0%, rgba(93, 159, 236, 0.12) 70%, rgba(94, 187, 245, 0.22) 100%);

    .MuiSvgIcon-root {
      color: rgba(0, 191, 165, 0.9);
      font-size: 110px;
    }
  }

  &:active {
    height: 170px;
    width: 270px;
    margin: 5px;

    .MuiSvgIcon-root {
      font-size: 100px;
    }
  }

  .MuiSvgIcon-root {
    color: rgba(0, 54, 77, 0.74);
    font-size: 100px;
  }
`;
