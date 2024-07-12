FROM node:22

COPY ./chat-app/package-lock.json .
COPY ./chat-app/package.json .

RUN npm install

COPY . .

WORKDIR /chat-app

RUN npm run build

RUN npm install -g serve

CMD ["npm", "run", "serve"]