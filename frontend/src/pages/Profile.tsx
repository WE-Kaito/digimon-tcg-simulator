import styled from "@emotion/styled";
import {useStore} from "../hooks/useStore.ts";
import {useEffect} from "react";
import ProfileDeck from "../components/ProfileDeck.tsx";
import BackButton from "../components/BackButton.tsx";
import {Headline2} from "../components/Header.tsx";
import ChooseAvatar from "../components/ChooseAvatar.tsx";
import {Loading} from "../components/FetchedCards.tsx";
import ChooseCardSleeve from "../components/ChooseCardSleeve.tsx";

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
            <Header>
                <Name style={{transform: "translateY(-8px)"}}>{user}</Name>
                <BackButton/>
            </Header>
            <div style={{display: "flex", flexDirection: "row", transform: "translateX(0px)"}}>
                <ChooseAvatar/>
                <ChooseCardSleeve/>
            </div>

            <Container>
                {isLoading && <Loading/>}
                {!isLoading && decks?.map((deck) => <ProfileDeck key={deck.id} deck={deck}/>)}
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
  background: rgba(0,0,0,0);
  border-radius: 10px;
  width: 100vw + 5px;
  height: 410px;
  overflow-y: scroll;
  padding: 5px;
  border: 1px solid #1d7dfc;
  
  &::-webkit-scrollbar {
    width: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #C5C5C5;
    -moz-border-radius-topright: 15px;
    -moz-border-radius-bottomright: 15px;
  }

  @media (min-width: 1000px) {
    width: 1032px;
    gap: 19px;
  }
  
  @media (min-width: 1600px) {
    gap: 23px;
  }
  
  @media (min-width: 1600px) and (min-height: 1000px) {
    height: 32vw;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 10px;
  margin-top: 5vh;

  @media (max-width: 766px) {
    margin-top: 1.5vh;
  }
`;

const Name = styled(Headline2)`
  font-family: 'Amiga Forever Pro2', sans-serif;
`;
