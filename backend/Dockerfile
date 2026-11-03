# Stage 1: Build binary
FROM golang:1.26.10-alpine AS builder

WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /app/petronesia-backend .

# Stage 2: Lightweight runtime
FROM alpine:3.23

WORKDIR /app

RUN apk --no-cache add ca-certificates tzdata curl

RUN adduser -D -u 1000 appuser && \
    mkdir -p /app/data && \
    chown -R appuser:appuser /app

COPY --from=builder /app/petronesia-backend /app/petronesia-backend

USER appuser

ENV PORT=8080 \
    DB_TYPE=sqlite \
    SQLITE_FILE=/app/data/petronesia.db

EXPOSE 8080


CMD ["/app/petronesia-backend"]
