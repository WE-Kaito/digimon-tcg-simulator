import MenuButton from "../components/MenuButton.tsx";
import styled from "@emotion/styled";
import Header from "../components/Header.tsx";
import {blueTriangles} from "../assets/particles.ts";
import ParticlesBackground from "../components/ParticlesBackground.tsx";


export default function MainMenu() {

    return (
        <Wrapper>
            <ParticlesBackground options={blueTriangles}/>
            <Container>
                <Header/>
                <MenuButton name={"Find game"} path={"/lobby"}/>
                <MenuButton name={"Deckbuilder"} path={"/deckbuilder"}/>
                <MenuButton name={"Profile"} path={"/profile"}/>
                <MenuButton name={"LOGOUT"} path={"/login"}/>
            </Container>
            <PatchNotes><PatchNotesText>
                <u>Patchnotes</u> (15/10)
                <ul>
                    <li>• <span>Drag card stacks with the new icon on hovered cards, starting from the 2. stacked card (for now, the to-be-replaced tamer are not included)</span>
                    </li>
                    <li>• <span>Put a card under a stack at the new small drop-zone at the bottom</span></li>
                    <li>• <span>Directly drop cards to deck top/bottom</span></li>
                    <li>• <span>Right click deck to open the option to retrieve the bottom card</span></li>
                    <li>• <span>⨯/+ - Buttons on hovered cards in Deckbuilder</span></li>
                    <li>• <span>Replaced avatars with 20 sprites by Tortoiseshel</span></li>
                    <li>• Trash/Deck(top/bottom)/Stack-bottom now marked as droppable, when hovering with dragged item
                    </li>
                    <li>• Log: Memory now [old ➟ new]; Security shuffle</li>
                    <li>• wider Deckbuilder</li>
                    <li>• Max username length now 16 chars</li>
                    <li>• additional backend validation should prevent broken deck data</li>
                    <li>• minor fixes</li>
                </ul>
                (31/10)
                <ul>
                    <li>• <span>32 Card Sleeves by Drak</span></li>
                    <li>• <span>10 more avatars by Tortoiseshel</span></li>
                    <li>• <span>Password Recovery:</span>
                    <br/> <span style={{color: "crimson", paddingLeft: 7}}>Please add a secure safety question in Profile!</span></li>
                    <li>• <span>Right click on a hand card to reveal it</span></li>
                    <li>• <span>Right click on details card image to open in new tab</span></li>
                    <li>• Replaced background pictures with tsParticles</li>
                    <li>• Timer and Auto-Redirect removed from game</li>
                    <li>• Mulligan and other actions should not be able to alter the position of opponents cards anymore</li>
                    <li>• minor adjustments and fixes</li>
                    <li>• <span style={{color: "#1d7dfc"}}>dev:</span> code cleanup and "how to run locally" md file</li>
                </ul>
            </PatchNotesText></PatchNotes>
        </Wrapper>
    );
}

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
  transform: translateY(0px);
  position: relative;
`;

const Container = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5vh;
  font-size: 19px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const PatchNotes = styled.div`
  position: absolute;
  top: 0;
  right: 20px;
  width: 295px;
  height: 650px;
  background: rgba(7, 13, 17, 0.9);
  filter: drop-shadow(0 0 3px #1d7dfc);
  border-radius: 10px;
  margin-top: 20px;

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
        color: #3cd9aa;
      }
    }
  }
`;
