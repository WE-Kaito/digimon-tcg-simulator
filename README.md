Project Drasil
---

Free fan-made manual/tabletop simulation of the [Digimon Card Game](https://world.digimoncard.com/) by [@WE-Kaito](https://github.com/WE-Kaito).

Thx to [@alessandrostagni](https://github.com/alessandrostagni) for maintaining our deployment and providing bots to the game.

Join our [discord community](https://discord.gg/sBdByGAh2y)! 

## Run locally

Install Docker, clone the repository, then choose one command:

```bash
# Self-contained production build
python3 run.py start

# Developer build with frontend hot reload
python3 run.py dev
```

The production build runs at [http://localhost:3000](http://localhost:3000). The developer build runs at [http://localhost:5173](http://localhost:5173).

Set `APP_PORT` to publish the production frontend on another port, for example `APP_PORT=8080 python3 run.py start`. Add `--foreground` to either command to attach to container logs.

See [How to run in a local environment](How-to-run-in-local-environment.md) for manual setup and troubleshooting.

  ---

**Feature Overview**:

<img width="1224" height="492" alt="image" src="https://github.com/user-attachments/assets/3a19bbc7-557c-4ed1-8df4-4b9abe2ddaea" />
<img width="1233" height="672" alt="image" src="https://github.com/user-attachments/assets/4eb295f1-a944-4b3a-b026-a143022ae6f9" />
<img width="1916" height="942" alt="image" src="https://github.com/user-attachments/assets/7ed05dba-f1ca-400c-865a-b39ea3496361" />
<img width="1918" height="939" alt="image" src="https://github.com/user-attachments/assets/ac26550a-0f38-4dfc-b374-76061fccb35d" />
<img width="1918" height="947" alt="image" src="https://github.com/user-attachments/assets/172367a5-f260-4e20-b37d-de5c2680df0e" />

  ---

**Upcoming**:
- Spectator mode.
- Desktop client.
- Reimplement bots.
- Tutorial dialogs.

  ---

 <sub>
  🚧 Disclaimer 🚧
   
This is a fan-made project and is not affiliated with or endorsed by Bandai Co., Ltd. or any official Digimon franchise entities. 
   
The Digimon name, characters,and all related materials are the property of Bandai Co., Ltd. and its respective owners.

The purpose of this project is to celebrate and pay tribute to the Digimon franchise and its fan community. 

It is a non-commercial, not-for-profit endeavor created by fans for fans.

Any copyrighted material used here is for fan appreciation and entertainment purposes only.

By accessing or using this project, you acknowledge and agree that it is an unofficial 

fan-made work and not an official part of the Digimon franchise.

If you are the owner of any copyrighted material used in this project and wish to have it removed, 

please contact me, and I will promptly comply with your request.
</sub>
