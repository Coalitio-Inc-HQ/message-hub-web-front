FROM node:22
COPY package-lock.json .
COPY package.json .
RUN npm install
COPY . .

RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist"]