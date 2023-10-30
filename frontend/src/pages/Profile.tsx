import styled from "@emotion/styled";
import {useStore} from "../hooks/useStore.ts";
import {useEffect} from "react";
import ProfileDeck from "../components/profile/ProfileDeck.tsx";
import BackButton from "../components/BackButton.tsx";
import {Headline2} from "../components/Header.tsx";
import ChooseAvatar from "../components/profile/ChooseAvatar.tsx";
import {Loading} from "../components/deckbuilder/FetchedCards.tsx";
import ChooseCardSleeve from "../components/profile/ChooseCardSleeve.tsx";
import {blueTriangles} from "../assets/particles.ts";
import ParticlesBackground from "../components/ParticlesBackground.tsx";
import UserSettings from "../components/profile/UserSettings.tsx";

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
            <ParticlesBackground options={blueTriangles}/>

            <Header>
                <Name style={{transform: "translateY(-8px)"}}>{user}</Name>
                <BackButton/>
            </Header>

            <UserSettings/>

            <Personalization>
                <ChooseAvatar/>
                <ChooseCardSleeve/>
            </Personalization>

            <Container>
                {isLoading && <Loading/>}
                {!isLoading && decks?.map((deck) => <ProfileDeck key={deck.id} deck={deck}/>)}
            </Container>
        </Wrapper>
    );
}

const Personalization = styled.div`
  display: flex;
  flex-direction: row;
  @media (max-width: 1050px) {
    flex-direction: column;
  }
`;

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  flex-direction: column;
  align-items: center;
  transform: translate(0px, 0px); // has to be here for the particles to work ???
`;

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 3px;
  align-items: flex-start;
  background: rgba(0,0,0,0);
  border-radius: 10px;
  width: 100vw + 5px;
  height: 410px;
  overflow-y: scroll;
  overflow-x: hidden;
  padding: 1px;
  border: 1px solid #1d7dfc;
  scrollbar-width: thin;
  
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
    padding: 5px;
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
  margin-top: 20px;
  margin-bottom: 140px;
  width: 1040px;
  @media (max-width: 1000px) {
    margin-bottom: 40px;
    width: 96.5vw;
  }
`;

const Name = styled(Headline2)`
  font-family: 'Amiga Forever Pro2', sans-serif;
`;
