up:
	docker compose up -d redis postgres
	yarn install-local-ssl
	yarn install --immutable
	yarn dev:watch

build:
	docker compose build --pull outline

compose-down:
	docker compose -f docker-compose.prod.yaml down

compose-prepare:
	docker build ./ -f Dockerfile.base -t goka-outline-base --no-cache
	docker compose -f docker-compose.prod.yaml build outline --no-cache

compose-up:
	docker compose -f docker-compose.prod.yaml up

compose-detach:
	docker compose -f docker-compose.prod.yaml up -d

compose-stop:
	docker compose -f docker-compose.prod.yaml stop

test:
	docker compose up -d postgres
	NODE_ENV=test yarn sequelize db:drop
	NODE_ENV=test yarn sequelize db:create
	NODE_ENV=test yarn sequelize db:migrate
	yarn test

watch:
	docker compose up -d redis postgres
	NODE_ENV=test yarn sequelize db:drop
	NODE_ENV=test yarn sequelize db:create
	NODE_ENV=test yarn sequelize db:migrate
	yarn test:watch

destroy:
	docker compose stop
	docker compose rm -f

.PHONY: up build destroy test watch prod-prepare prod-up # let's go to reserve rules names
