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
import AddBoxRoundedIcon from '@mui/icons-material/AddBoxRounded';
import {useNavigate} from "react-router-dom";

export type DeckIdOrder = string[];

export default function Profile({user}: { user: string }) {

    const loadOrderedDecks = useStore((state) => state.loadOrderedDecks);
    const deckIdOrder = useStore((state) => state.deckIdOrder);
    const setDeckIdOrder = useStore((state) => state.setDeckIdOrder);
    const isLoading = useStore((state) => state.isLoading);

    const [orderedDecks, setOrderedDecks] = useState<DeckType[]>([]);
    const [sleeveSelectionOpen, setSleeveSelectionOpen] = useState(false);
    const [imageSelectionOpen, setImageSelectionOpen] = useState(false);

    const navigate = useNavigate();
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
                        : <>
                            <SortableContext items={orderedDecks}>
                             {orderedDecks?.map((deck, index) => <>
                                 <SortableProfileDeck key={deck.id} deck={deck}
                                                      setSleeveSelectionOpen={setSleeveSelectionOpen}
                                                      setImageSelectionOpen={setImageSelectionOpen}
                             />
                                 {orderedDecks.length < 16 && index === orderedDecks.length - 1 &&
                                     <NewDeckButton onClick={() => navigate("/deckbuilder")}>
                                         <AddBoxRoundedIcon/>
                                     </NewDeckButton>}
                             </>)}
                            </SortableContext>
                            {}
                        </>
                    }
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
