FROM arm32v6/node:13-alpine
RUN apk --no-cache add build-base python

RUN mkdir /app
WORKDIR /app
COPY . /app
RUN npm install

EXPOSE 80
CMD ["npm", "start"]
