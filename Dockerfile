FROM openjdk:20

ENV ENVIRONMENT=prod

LABEL maintainer="WE-Kaito"

ADD backend/target/digimon-tcg-sim.jar digimon-tcg-sim.jar

CMD [ "sh", "-c", "java -Dserver.port=$PORT -jar /app.jar" ]