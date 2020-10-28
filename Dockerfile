FROM node:12 as builder

WORKDIR /app

COPY . .

RUN npm run build

CMD ["npm", "run", "start"]
