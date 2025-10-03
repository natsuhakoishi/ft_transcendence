FROM node:22.18-slim

WORKDIR /app/srcs/backend

RUN apt-get update -y && apt-get install -y sqlite3

COPY setup-backend.sh /scripts/
RUN chmod +x /scripts/setup-backend.sh

CMD ["/scripts/setup-backend.sh"]

