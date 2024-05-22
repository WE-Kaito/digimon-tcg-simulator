FROM openjdk:21

ENV ENVIRONMENT=prod

LABEL maintainer="WE-Kaito"

ADD backend/target/digimon-tcg-sim.jar digimon-tcg-sim.jar

CMD ["sh", "-c", "java -DServer.port=$PORT -jar /digimon-tcg-sim.jar"]
