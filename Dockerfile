# Используем образ Node.js
FROM node:20

# Директория внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь проект
COPY . .

# Сборка проекта
RUN npm run build

# Указываем порт
EXPOSE 3000

# Запуск приложения
CMD ["node", "dist/main.js"]
