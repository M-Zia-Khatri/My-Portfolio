.PHONY: help build up down restart logs clean ps shell-client shell-server shell-db migrate

# Detect docker compose command
DOCKER_COMPOSE := $(shell command -v docker-compose 2> /dev/null)
ifndef DOCKER_COMPOSE
	DOCKER_COMPOSE := docker compose
endif

# Default target
help:
	@echo "Available commands:"
	@echo "  make build          - Build all Docker containers"
	@echo "  make up             - Start all containers"
	@echo "  make down           - Stop all containers"
	@echo "  make restart        - Restart all containers"
	@echo "  make logs           - View logs from all containers"
	@echo "  make logs-client    - View client logs"
	@echo "  make logs-server    - View server logs"
	@echo "  make logs-db        - View database logs"
	@echo "  make ps             - List running containers"
	@echo "  make shell-client   - Access client container shell"
	@echo "  make shell-server   - Access server container shell"
	@echo "  make shell-db       - Access database container shell"
	@echo "  make migrate        - Run database migrations"
	@echo "  make seed           - Run database seed"
	@echo "  make clean          - Stop containers and remove volumes"
	@echo "  make rebuild        - Rebuild and restart all containers"
	@echo "  make prune          - Remove unused Docker resources"

# Build containers
build:
	$(DOCKER_COMPOSE) build

# Start containers
up:
	$(DOCKER_COMPOSE) up -d

# Stop containers
down:
	$(DOCKER_COMPOSE) down

# Restart containers
restart:
	$(DOCKER_COMPOSE) restart

# View logs
logs:
	$(DOCKER_COMPOSE) logs -f

logs-client:
	$(DOCKER_COMPOSE) logs -f client

logs-server:
	$(DOCKER_COMPOSE) logs -f server

logs-db:
	$(DOCKER_COMPOSE) logs -f db

# List containers
ps:
	$(DOCKER_COMPOSE) ps

# Access container shells
shell-client:
	$(DOCKER_COMPOSE) exec client sh

shell-server:
	$(DOCKER_COMPOSE) exec server sh

shell-db:
	$(DOCKER_COMPOSE) exec db mariadb -u root -p

# Run migrations
migrate:
	$(DOCKER_COMPOSE) exec server pnpm prisma migrate deploy

# Run seed
seed:
	$(DOCKER_COMPOSE) exec server pnpm prisma db seed

# Clean up
clean:
	$(DOCKER_COMPOSE) down -v
	docker system prune -f

# Rebuild and restart
rebuild:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) build --no-cache
	$(DOCKER_COMPOSE) up -d

# Prune Docker system
prune:
	docker system prune -a -f --volumes

# Local development commands
.PHONY: db-start db-stop db-logs server client

db-start:
	docker compose -f docker-compose.db.yml up -d

db-stop:
	docker compose -f docker-compose.db.yml down

db-logs:
	docker compose -f docker-compose.db.yml logs -f

server:
	cd server && pnpm dev

client:
	cd client && pnpm dev

client-host:
	cd client && pnpm dev --host