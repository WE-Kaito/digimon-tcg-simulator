FROM openjdk:20

ENV ENVIRONMENT=prod

LABEL maintainer="WE-Kaito"

ADD backend/target/app.jar app.jar

EXPOSE 8080

CMD [ "sh", "-c", "java -jar /app.jar" ]