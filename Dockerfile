FROM openjdk:20

ENV ENVIRONMENT=prod

LABEL maintainer="WE-Kaito"

ADD backend/target/digimon-tcg-sim.jar /app/digimon-tcg-sim.jar

CMD ["sh", "-c", "java -DServer.port=$PORT -jar /app/digimon-tcg-sim.jar"]
