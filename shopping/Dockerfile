FROM node

WORKDIR /app/shopping

COPY package.json .

RUN npm install
RUN npm install bcryptjs

COPY . .

EXPOSE 8003

CMD ["npm","start"]