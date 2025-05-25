import MenuBackgroundWrapper from "../components/MenuBackgroundWrapper.tsx";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { Loading } from "../components/deckbuilder/FetchedCards.tsx";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { Fragment, useCallback, useLayoutEffect, useState } from "react";
import SortableProfileDeck from "../components/profile/SortableProfileDeck.tsx";
import AddBoxRoundedIcon from "@mui/icons-material/AddBoxRounded";
import styled from "@emotion/styled";
import { useGeneralStates } from "../hooks/useGeneralStates.ts";
import { DeckType } from "../utils/types.ts";
import { useNavigate } from "react-router-dom";
import MenuDialog from "../components/MenuDialog.tsx";
import CustomDialogTitle from "../components/profile/CustomDialogTitle.tsx";
import ChooseCardSleeve from "../components/profile/ChooseCardSleeve.tsx";
import ChooseDeckImage from "../components/profile/ChooseDeckImage.tsx";
import BackButton from "../components/BackButton.tsx";

export default function Decks() {
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

            <DeckHeaderContainer>
                <div
                    style={{
                        width: "100%",
                        height: "3.5em",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <span>Decks</span>
                    <BackButton />
                </div>
                <hr style={{ width: "100vw", maxWidth: 1204 }} />
            </DeckHeaderContainer>

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
                                <NewDeckButton onClick={toDeckBuilder}>
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
        font-size: 26px;
        @media (max-width: 1050px) {
            padding-left: 5px;
        }
        transform: translateY(5px);
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
