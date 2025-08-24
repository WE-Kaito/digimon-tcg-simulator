import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Loading } from "../components/deckbuilder/FetchedCards.tsx";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { Fragment, useCallback, useLayoutEffect, useState } from "react";
import SortableProfileDeck from "../components/profile/SortableProfileDeck.tsx";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import styled from "@emotion/styled";
import { DeckType } from "../utils/types.ts";
import { useNavigate } from "react-router-dom";
import MenuDialog from "../components/MenuDialog.tsx";
import CustomDialogTitle from "../components/profile/CustomDialogTitle.tsx";
import ChooseCardSleeve from "../components/profile/ChooseCardSleeve.tsx";
import ChooseDeckImage from "../components/profile/ChooseDeckImage.tsx";
import BackButton from "../components/BackButton.tsx";
import { useDeckStates } from "../hooks/useDeckStates.ts";
import SectionHeadline from "../components/SectionHeadline.tsx";

export default function Decks() {
    const loadOrderedDecks = useDeckStates((state) => state.loadOrderedDecks);
    const deckIdOrder = useDeckStates((state) => state.deckIdOrder);
    const setDeckIdOrder = useDeckStates((state) => state.setDeckIdOrder);
    const isLoading = useDeckStates((state) => state.isLoading);
    const clearDeck = useDeckStates((state) => state.clearDeck);

    const [renderAddButton, setRenderAddButton] = useState(false);
    const [orderedDecks, setOrderedDecks] = useState<DeckType[]>([]);
    const [sleeveSelectionOpen, setSleeveSelectionOpen] = useState(false);
    const [imageSelectionOpen, setImageSelectionOpen] = useState(false);

    const navigate = useNavigate();
    const sensors = useSensors(useSensor(PointerSensor));

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!!over && active.id !== over.id) {
            const oldIndexId = deckIdOrder.findIndex((id) => id === active.id);
            const newIndexId = deckIdOrder.findIndex((id) => id === over.id);
            setDeckIdOrder(arrayMove(deckIdOrder, oldIndexId, newIndexId), setOrderedDecks);
        }
    }

    function handleOnClose() {
        setSleeveSelectionOpen(false);
        setImageSelectionOpen(false);
        loadOrderedDecks(setOrderedDecks);
    }

    function toDeckBuilder() {
        navigate("/deckbuilder");
        clearDeck();
    }

    const stableLoadOrderedDecks = useCallback(() => loadOrderedDecks(setOrderedDecks), [loadOrderedDecks]);
    useLayoutEffect(() => stableLoadOrderedDecks(), [stableLoadOrderedDecks]);

    useLayoutEffect(() => {
        if (!isLoading && orderedDecks.length < 16) setRenderAddButton(true);
    }, [isLoading, orderedDecks.length]);

    return (
        <MenuBackgroundWrapper style={{ justifyContent: "flex-start" }}>
            <MenuDialog onClose={handleOnClose} open={sleeveSelectionOpen} PaperProps={{ sx: { overflow: "hidden" } }}>
                <CustomDialogTitle handleOnClose={handleOnClose} variant={"Sleeve"} />
                <ChooseCardSleeve />
            </MenuDialog>

            <MenuDialog onClose={handleOnClose} open={imageSelectionOpen}>
                <CustomDialogTitle handleOnClose={handleOnClose} variant={"Image"} />
                <ChooseDeckImage />
            </MenuDialog>

            <SectionHeadline headline={"Decks"} rightElement={<BackButton />} />

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <Container>
                    {isLoading ? (
                        <Loading />
                    ) : (
                        <>
                            <SortableContext items={orderedDecks}>
                                {orderedDecks?.map((deck) => (
                                    <Fragment key={deck.id}>
                                        <SortableProfileDeck
                                            deck={deck}
                                            setSleeveSelectionOpen={setSleeveSelectionOpen}
                                            setImageSelectionOpen={setImageSelectionOpen}
                                        />
                                    </Fragment>
                                ))}
                            </SortableContext>
                            {renderAddButton && (
                                <NewDeckButton className={"button"} onClick={toDeckBuilder}>
                                    <AddBoxRoundedIcon />
                                </NewDeckButton>
                            )}
                        </>
                    )}
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

const NewDeckButton = styled.div`
    cursor: pointer;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 12px;
    height: 180px;
    width: 280px;
    background: linear-gradient(
        20deg,
        rgba(87, 171, 255, 0.06) 0%,
        rgba(93, 159, 236, 0.06) 70%,
        rgba(94, 187, 245, 0.16) 100%
    );
    padding: 3px;
    box-shadow: inset 0 0 3px 0 rgba(148, 224, 255, 0.4);

    &:hover {
        background: linear-gradient(
            20deg,
            rgba(87, 171, 255, 0.12) 0%,
            rgba(93, 159, 236, 0.12) 70%,
            rgba(94, 187, 245, 0.22) 100%
        );

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
