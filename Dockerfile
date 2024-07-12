# Используем образ Node.js
FROM node:22

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json в контейнер
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы в контейнер
COPY . .

# Собираем приложение для production
EXPOSE 3000
RUN npm install -g serve
RUN npm run build
CMD ["serve", "-s", "dist"]
