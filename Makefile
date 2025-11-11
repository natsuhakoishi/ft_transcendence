DC := ./docker-compose.yml

all: re

build:
	docker compose -f $(DC) build

up:
	docker compose -f $(DC) up -d

down:
	docker compose -f $(DC) down

ps:
	docker ps

clean:
	docker system prune

dbclean:
	rm -rf ./database/*
	find ./app/srcs/backend/assets/avatars -type f ! \( -name 'default.*' -o -name '*_dev.*' -o -name 'ai.webp' \) -delete\

cclean:
	sudo rm -rf ./certs

fclean:
	docker stop $(shell  docker ps -qa) 2>/dev/null || true
	docker rm $(shell  docker ps -qa) 2>/dev/null || true
	docker rmi $(shell  docker images -qa) 2>/dev/null || true
	docker volume rm $(shell  docker volume ls -q) 2>/dev/null || true
	docker network rm $(shell  docker network ls -q) 2>/dev/null || true

aclean: dbclean fclean

aaclean: dbclean cclean fclean

re: down fclean up

rere: aclean re
