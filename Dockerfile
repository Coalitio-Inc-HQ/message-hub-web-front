FROM node:22

COPY ./chat-app/package-lock.json .
COPY ./chat-app/package.json .

RUN npm install

COPY . .

WORKDIR /chat-app

# Собираем проект
RUN npm run build

RUN npm install -g serve

CMD ["serve", "-s", "dist", "--listen", "tcp://0.0.0.0:8080"]
