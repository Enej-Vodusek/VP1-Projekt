# FROM node:20-bullseye-slim

# WORKDIR /app

# COPY package*.json ./

# RUN npm install

# COPY . .

# EXPOSE 3000

# CMD ["npm", "run", "dev"]

FROM node:20-bullseye

RUN mkdir -p uploads

WORKDIR /app

RUN apt-get update && \
    apt-get install -y python3 python3-pip

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm","run","dev"]
