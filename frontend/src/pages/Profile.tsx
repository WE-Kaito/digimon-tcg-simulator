import styled from "@emotion/styled";
import {useStore} from "../hooks/useStore.ts";
import {useEffect, useState} from "react";
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
import {Dialog} from "@mui/material";
import ChooseDeckImage from "../components/profile/ChooseDeckImage.tsx";
import CustomDialogTitle from "../components/profile/CustomDialogTitle.tsx";
import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";

export type DeckIdOrder = string[];

export default function Profile({user}: { user: string }) {

    const loadOrderedDecks = useStore((state) => state.loadOrderedDecks);
    const deckIdOrder = useStore((state) => state.deckIdOrder);
    const setDeckIdOrder = useStore((state) => state.setDeckIdOrder);
    const isLoading = useStore((state) => state.isLoading);

    const [orderedDecks, setOrderedDecks] = useState<DeckType[]>([]);
    const [sleeveSelectionOpen, setSleeveSelectionOpen] = useState(false);
    const [imageSelectionOpen, setImageSelectionOpen] = useState(false);

    const sensors = useSensors(useSensor(PointerSensor));

    function handleDragEnd(event: DragEndEvent) {
        const {active, over} = event;

        if (!!over && (active.id !== over.id)) {
            const oldIndexIds = deckIdOrder.findIndex((id) => id === active.id);
            const newIndexIds = deckIdOrder.findIndex((id) => id === over.id);
            setDeckIdOrder(arrayMove(deckIdOrder, oldIndexIds, newIndexIds), setOrderedDecks);
        }
    }

    function handleOnClose() {
        setSleeveSelectionOpen(false);
        setImageSelectionOpen(false);
        loadOrderedDecks(setOrderedDecks)
    }

    useEffect(() => loadOrderedDecks(setOrderedDecks), []);

    return (
        <MenuBackgroundWrapper alignedTop>
            <Header>
                <Name>{user}</Name>
                <BackButton/>
            </Header>

            <UserSettings/>

            <Dialog maxWidth={"xl"} onClose={handleOnClose} open={sleeveSelectionOpen}
                    sx={{ background: "rgba(18,35,66,0.6)"}} PaperProps={{sx: { background: "rgb(12,12,12)" }}}>
                <CustomDialogTitle handleOnClose={handleOnClose} variant={"Sleeve"}/>
                <ChooseCardSleeve/>
            </Dialog>

            <Dialog maxWidth={"xl"} onClose={handleOnClose} open={imageSelectionOpen}
                    sx={{ background: "rgba(18,35,66,0.6)"}} PaperProps={{sx: { background: "rgb(12,12,12)" }}}>
                <CustomDialogTitle handleOnClose={handleOnClose} variant={"Image"}/>
                <ChooseDeckImage/>
            </Dialog>

            <ChooseAvatar/>

            <DeckHeaderContainer>
                <span>Decks</span>
                <hr style={{width: "100vw", maxWidth:1204}}/>
            </DeckHeaderContainer>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <Container>
                    {isLoading
                        ? <Loading/>
                        : <SortableContext items={orderedDecks}>
                             {orderedDecks?.map((deck) => <SortableProfileDeck key={deck.id} deck={deck}
                                                      setSleeveSelectionOpen={setSleeveSelectionOpen}
                                                      setImageSelectionOpen={setImageSelectionOpen}
                             />)}
                          </SortableContext>}
                </Container>
            </DndContext>
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
