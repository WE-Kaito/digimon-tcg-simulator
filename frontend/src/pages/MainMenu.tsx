import MenuButton from "../components/MenuButton.tsx";
import styled from "@emotion/styled";
import Header from "../components/Header.tsx";


export default function MainMenu() {

    return (
        <Wrapper>
            <Header/>
            <MenuButton name={"Find game"} path={"/lobby"}/>
            <MenuButton name={"Deckbuilder"} path={"/deckbuilder"}/>
            <MenuButton name={"Profile"} path={"/profile"}/>
            <MenuButton name={"LOGOUT"} path={"/login"}/>

            <PatchNotes><PatchNotesText>
                <u>Patchnotes (01/10)</u>
            <ul>
                <li>• fixed chatlog messages containing " <span>:</span> "</li>
                <li>• fixed drag & drop not working on mobile devices</li>
                <li>• fixed doubled distribution of cards & starting player</li>
                <li><b>Deckbuilder:</b></li>
                <li>• import / export </li>
                <li>• duplicate cards are now shown as stacks</li>
                <li>• fixed position of cards in deck</li>
                <li><b>Login:</b></li>
                <li>• restricted input length</li>
                <li>• toast for login attempt with wrong credentials</li>
            </ul></PatchNotesText></PatchNotes>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  display: flex;
  width: 100vw;
  flex-direction: column;
  align-items: center;
  gap: 5vh;
  font-size: 19px;
  transform: translateY(-7.5vh);
  margin-top: 15.5vh;
`;

const PatchNotes = styled.div`
  position: absolute;
  top: 0;
  right: 20px;
  width: 300px;
  height: 260px;
  background: rgba(7, 13, 17, 0.9);
  filter: drop-shadow(0 0 3px #1d7dfc);
  border-radius: 10px;

  @media (max-width: 1000px) {
    visibility: hidden;
  }

`;

const PatchNotesText = styled.p`
  font-family: Cuisine, sans-serif;
  transform: translateX(-50px);

  ul {
    list-style: none;
    font-size: 11px;
    text-align: left;

    li {
      transform: translateX(28px);
      max-width: 255px;
      padding-bottom: 2px;

      span {
        color: #fcd414;
        font-size: 1.1em;
        font-weight: 800;
      }
    }
  }
`;
