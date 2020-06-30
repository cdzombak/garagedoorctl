FROM arm32v6/node:13-alpine
RUN apk --no-cache add build-base python

RUN mkdir /app
WORKDIR /app
COPY . /app
RUN rm -rf /app/alexa /app/out /app/.env.example /app/.gitignore /app/Makefile
RUN npm install

EXPOSE 80
CMD ["npm", "start"]
