FROM golang:1.24

COPY . /app
WORKDIR /app

RUN go build -o server

EXPOSE 8081
CMD [ "./server" ]
