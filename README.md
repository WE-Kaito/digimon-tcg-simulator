Project Drasil
---

This started as a graduation project for a full stack coding bootcamp.
It was always a dream of mine to make some sort of Digimon fan game, so why not making the still missing sim for [its card game](https://world.digimoncard.com/)?

Feel free to use the code to improve upon. Reviews, bug-reports and feature-requests are also very welcome!

**Features**:
- [x] Register with a unique username + password to use the App.
- [X] Password Recovery with a safety question + answer.
- [x] Deckbuilder using [digimoncard.io's API](https://documenter.getpostman.com/view/14059948/TzecB4fH).
- [X] Import / Export your deck list. (Currently TTS format only)
- [x] Drag and drop cards and card-stacks.
- [x] Edit your decks and set your avatar, card sleeve and active deck on the profile page.
- [x] Chat with other players and invite your friends in the Lobby.
- [x] Mobile compatible (Game page currently not too optimized).
- [X] Manual simulation of the *Digimon Card Game* with audio and animations and a Log

**Try it on [www.digi-tcg.online](https://www.digi-tcg.online/)**

Check the [Wiki page](https://github.com/WE-Kaito/digimon-tcg-simulator/wiki) for futher information.

Join our discord community! https://discord.gg/sBdByGAh2y

---

**Used Technologies, Frameworks, and Libraries:**

- **Frontend:** React with Vite, Axios, Zustand, Emotion, react-dnd, react-use-websocket

- - **Other libraries:** react-router-dom, react-awesome-reveal, react-arrows, lottie-react, react-toastify, react-particles
  - **Design:** Figma, Excalidraw

- **Backend:** Spring Boot with Spring WebFlux, WebSocket, Security + MongoDB

- **Testing:** JUnit, AssertJ, Mockito, MockMvc, Flapdoodle (for integration tests)

- **Deployment:** GitHub Actions for CI/CD, Docker, Heroku

[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=we-kaito_digimon-tcg-simulator-backend&metric=coverage)](https://sonarcloud.io/summary/new_code?id=we-kaito_digimon-tcg-simulator-backend)

---

![deckbuilderExample2](https://github.com/WE-Kaito/digimon-tcg-simulator/assets/98795399/26572873-7672-4ff4-b24b-a2d63e3ad482) ![profileExample2](https://github.com/WE-Kaito/digimon-tcg-simulator/assets/98795399/49ccc4e9-a903-4812-bdef-559066b653fc) ![lobbyExample2](https://github.com/WE-Kaito/digimon-tcg-simulator/assets/98795399/1a471309-a350-42a7-aed9-c46581f881ee)

![gameExample2](https://github.com/WE-Kaito/digimon-tcg-simulator/assets/98795399/f6ed2f0f-875c-4eb3-a4df-8df30e81adf3)

![loginExample2](https://github.com/WE-Kaito/digimon-tcg-simulator/assets/98795399/884bdaf1-bdad-4dc4-ad50-56d3cefdd0de) ![registerExample2](https://github.com/WE-Kaito/digimon-tcg-simulator/assets/98795399/f8f8f582-fa21-44e9-a1ea-7a8275b65a42) ![mainmenuExample2](https://github.com/WE-Kaito/digimon-tcg-simulator/assets/98795399/ea2e2f0e-b5ce-458d-b86e-baa3b8e83ac7)

---

 <sub>
  🚧 Disclaimer 🚧

  ---
   
This is a fan-made project and is not affiliated with or endorsed by Bandai Co., Ltd. or any official Digimon franchise entities. 
   
The Digimon name, characters,and all related materials are the property of Bandai Co., Ltd. and its respective owners.

The purpose of this project is to celebrate and pay tribute to the Digimon franchise and its fan community. 

It is a non-commercial, not-for-profit endeavor created by fans for fans.

Any copyrighted material used here is for fan appreciation and entertainment purposes only.

By accessing or using this fan project, you acknowledge and agree that it is an unofficial 

fan-made work and not an official part of the Digimon franchise.

If you are the owner of any copyrighted material used in this project and wish to have it removed, 

please contact me, and I will promptly comply with your request.
</sub>
