FROM node

WORKDIR /app/customer

COPY package.json .

RUN npm install
RUN npm install bcryptjs
COPY . .

EXPOSE 8001

CMD ["npm","start"]