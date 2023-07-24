FROM openjdk:20

ENV ENVIRONMENT=prod

LABEL maintainer="WE-Kaito"

ADD backend/target/digimon-tcg-sim.jar digimon-tcg-sim.jar

EXPOSE 8080

CMD [ "sh", "-c", "java -jar /digimon-tcg-sim.jar" ]