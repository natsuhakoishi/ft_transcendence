FROM node:22.18-slim

WORKDIR /app/srcs/frontend

COPY . .
COPY setup-frontend.sh /scripts/
RUN chmod +x /scripts/setup-frontend.sh

CMD ["/scripts/setup-frontend.sh"]
