up:
	docker compose up -d redis postgres
	yarn install-local-ssl
	yarn install --immutable
	yarn dev:watch

build:
	docker compose build --pull outline

prod-prepare:
	yarn install --immutable
	yarn build
	docker compose -f docker-compose.prod.yaml build outline
	docker compose -f docker-compose.prod.yaml up -d postgres redis

prod-up:
	docker compose -f docker-compose.prod.yaml up -d

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
