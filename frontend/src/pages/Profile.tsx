import styled from "@emotion/styled";
import {useStore} from "../hooks/useStore.ts";
import {useEffect} from "react";
import ProfileDeck from "../components/ProfileDeck.tsx";
import BackButton from "../components/BackButton.tsx";
import {ToastContainer} from "react-toastify";
import {Headline2} from "../components/Header.tsx";


export default function Profile({user}: { user: string }) {

    const fetchDecks = useStore((state) => state.fetchDecks);
    const decks = useStore((state) => state.decks);
    const isLoading = useStore((state) => state.isLoading);
    const getActiveDeck = useStore((state) => state.getActiveDeck);
    const activeDeckId = useStore((state) => state.activeDeckId);

    useEffect(() => {
        fetchDecks();
    }, [fetchDecks]);

    useEffect(() => {
        getActiveDeck();
    }, [getActiveDeck, activeDeckId]);

    return (
        <Wrapper>
            <div style={{display: "flex", justifyContent:"space-between", padding: "10px"}}>
                <Headline2 style={{transform: "translateY(-8px)"}}>{user}</Headline2>
                <ToastContainer/>
                <BackButton/>
            </div>

                <Container>
                    {!isLoading && decks?.map((deck, index) => <ProfileDeck key={index} deck={deck}/>)}
                </Container>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  flex-direction: column;
  justify-content: space-between;
`;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5vw;
  align-items: flex-start;
  background: #0e0e0e;
  border-radius: 10px;
  width: 100vw;
  height: 410px;
  max-width: 1000px;
`;