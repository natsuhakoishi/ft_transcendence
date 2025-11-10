FROM node:22.18-slim

WORKDIR /app/srcs/backend

RUN apt-get update -y && apt-get install -y sqlite3 openssl

COPY setup-backend.sh /scripts/
RUN chmod +x /scripts/setup-backend.sh

ENTRYPOINT ["/scripts/setup-backend.sh"]

