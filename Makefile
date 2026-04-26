.PHONY: dev-client dev-server dev lint-fe lint-be

dev-client:
	cd client-app/client && npm run dev

dev-server:
	cd client-app/server && uvicorn main:app --reload

dev:
	make dev-server & make dev-client

lint-fe:
	cd client-app/client && npx eslint src/

lint-be:
	cd client-app/server && ruff check .

build-fe:
	cd client-app/client && npm run build
