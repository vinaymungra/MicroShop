FROM node

WORKDIR /app/products

COPY package.json .

RUN npm install
RUN npm install bcryptjs
COPY . .

EXPOSE 8002

CMD ["npm","start"]