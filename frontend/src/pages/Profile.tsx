import styled from "@emotion/styled";
import {useStore} from "../hooks/useStore.ts";
import {useEffect} from "react";
import ProfileDeck from "../components/ProfileDeck.tsx";
import BackButton from "../components/BackButton.tsx";
import {ToastContainer} from "react-toastify";


export default function Profile() {

    const fetchDecks = useStore((state) => state.fetchDecks);
    const decks = useStore((state) => state.decks);
    const isLoading = useStore((state) => state.isLoading);

    useEffect(() => {
        fetchDecks();
    }, [fetchDecks]);

    return (
        <Wrapper>
            <ToastContainer/>
            <BackButton/>
            <h1>Profile</h1>
            {!isLoading &&
                <Container>
                    {decks?.map((deck, index) => <ProfileDeck key={index} deck={deck}/>)}
            </Container>}
        </Wrapper>
    );
}

const Wrapper = styled.div`

`;

const Container = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
  align-items: center;

  background: #0e0e0e;
  border-radius: 10px;
  width: 100vw;
  max-width: 1000px;
`;