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
                <u>Patchnotes (23/09)</u>
            <ul>
                <li><b>Overhaul of how deck data is handled. </b><br/>
                    <span>Old decks had to be removed.</span>
                </li>
                <li><b>Deckbuilder:</b></li>
                <li>• Removed drag & drop</li>
                <li>• Added max. deck limit</li>
                <li style={{color:"#DCBB14FF"}}>• (24/9) Unfiltered cards no longer displayed</li>
                <li style={{color:"#DCBB14FF"}}>• (24/9) Fixed card type of EX5-020 & EX5-012</li>
                <li><b>Game:</b></li>
                <li>• Improved mobile view</li>
                <li>• Log: added memory; fixed starting player</li>
                <li>• Added buttons to add top/bot security card to hand</li>
                <li>• Mulligan: Players can not start before other player decided whether they keep their hand.</li>
                <li>• Cards will shift if players reveal at the same time.</li>
                <li>• Fixed sending Tamer suspension to opponent</li>
                <li>• Inherited Effects now visible on 2nd row</li>
                <li>• Open Security Stack container size increased</li>
                <li><b>Lobby:</b></li>
                <li>• unnamed user should not be visible anymore</li>


                <li></li>
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
  height: 420px;
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
      color: crimson;
    }
  }
}
`;
