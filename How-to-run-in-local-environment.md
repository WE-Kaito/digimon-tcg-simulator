# Run the platform in your local environment 

<b>NOTE:</b> It is strongly advised to run the platform using docker compose.
However, Project Drasil can also be run outside of docker if required (see [Manual Setup](#manual-setup))

## Docker compose

Run `docker compose up -d` to create all required containers.
NOTE: Windows users will need to share the root directory of the repo with Docker by going to `Settings > Resources > File Sharing`, adding the repo directory path and hitting `Apply & Restart`

The application will be available at [http://localhost:5173](http://localhost:5173). Vite's hot reload should work out of the box. Any changes to the backend won't be applied until the container is re-created, which can be done by running `./compile-backend.sh`. All database data is stored in an external volume, so bringing down the mongodb container will not delete database data, but dropping volumes <b>will</b>.

## Manual Setup

### Build Frontend

- Go inside the frontend and build the react app:
`cd frontend`
`npm run build`

- Copy the `dist` folder inside the backend app folder:

`cp -r dist ../backend/src/main/resources/static`


### Build Backend

- Make sure `java` and `javac` versions have both version at least >=20.
  Verify with:

  `java --version`
  `javac --version`

If not, follow the instructions on how to install [OpenJDK](https://openjdk.org/install/) and make sure you install compatible versions.

- Make sure hardcoded URIs are pointing to localhost:

- `websocketURL` in [Game.tsx](frontend/src/pages/Game.tsx).
- `websocketURL` in [Lobby.tsx](frontend/src/pages/Lobby.tsx).

- Compile code:

`mvn -B package --file backend/pom.xml`

`digimon-tcg-sim.jar` file will be created in `backend/target/` folder.

### Run the application

- Make sure [MongoDB](https://www.mongodb.com/docs/v2.4/tutorial/install-mongodb-on-red-hat-centos-or-fedora-linux/) is installed and running before running the application.

- Start mongodb with `mongod --dbpath [PATH_TO_YOUR_DB]`.

- Make sure the `MONGO_DB_URI` environment variable is set with the URI for connecting to your database.

- Make sure the port specified in the `PORT` environment variable is not already being used on your system.

- Start the application with:

`java -DServer.port=$PORT -jar backend/target/digimon-tcg-sim.jar`


## Troubleshooting

``maven error when running mvn -B package --file backend/pom.xml: release version 20 not supported``

Make sure you have a version of openjdk with at least version 20.
If you haven't installed and it's not working already, make sure the JAVA_HOME is pointing to the right version:
E.g:
`export JAVA_HOME="/usr/lib/jvm/java-21-openjdk/`

If you're using Fedora, make sure that correct alternatives are selected for both `java` and `javac` with:
``update-alternatives --config javac``
``update-alternatives --config javac``

-----
``mongod: error while loading shared libraries: libcrypto.so.1.1: cannot open shared object file: No such file or directory``

Install `openssl1.1`.
You can find the rpm for Fedora [here](https://rpmfind.net/linux/rpm2html/search.php?query=openssl1.1).
Then install with:

`sudo rpm -i openssl1.1xxxx.fcxx.xxx.rpm`

-----
``"NoSuchFieldError: JCImport does not have member field JCTree qualid"``

Check the lombok version in the pom.xml file as suggested [here](https://stackoverflow.com/questions/77171270/compilation-error-after-upgrading-to-jdk-21-nosuchfielderror-jcimport-does-n)

