DC := ./docker-compose.yml

all: re

build:
	sudo docker compose -f $(DC) build

up:
	sudo docker compose -f $(DC) up -d

down:
	sudo docker compose -f $(DC) down

ps:
	sudo docker ps

clean:
	sudo docker system prune

dbclean:
	rm -rf ./database/*
	find ./app/srcs/backend/assets/avatars -type f ! -name 'default.*' -delete\

fclean:
	sudo docker stop $(shell sudo docker ps -qa) 2>/dev/null || true
	sudo docker rm $(shell sudo docker ps -qa) 2>/dev/null || true
	sudo docker rmi $(shell sudo docker images -qa) 2>/dev/null || true
	sudo docker volume rm $(shell sudo docker volume ls -q) 2>/dev/null || true
	sudo docker network rm $(shell sudo docker network ls -q) 2>/dev/null || true

aclean: dbclean fclean

re: down fclean up

keep: re
