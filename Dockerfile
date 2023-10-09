FROM node:lts-bullseye-slim

# Install synthony/faceplate
WORKDIR /app
COPY ./ /app

RUN cd /app

RUN apt update
RUN apt-get install -y bash yarn

ENTRYPOINT ["yarn", "build"]
