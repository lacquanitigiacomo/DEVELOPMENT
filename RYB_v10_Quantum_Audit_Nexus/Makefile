# RYB Quantum Audit Nexus — Makefile
.PHONY: help install dev dev-frontend dev-backend dev-mobile build test test-e2e test-load docker-up docker-down status logs clean update check

help: ## Mostra tutti i comandi
	@echo "🚀 RYB Quantum Audit Nexus — Comandi disponibili:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  [36m%-15s[0m %s
", $$1, $$2}'

install: ## Installa dipendenze tutti i progetti
	@echo "📦 Installing frontend..."
	cd frontend && npm install
	@echo "📦 Installing backend..."
	cd backend && npm install
	@echo "📦 Installing mobile..."
	cd mobile && npm install
	@echo "📦 Installing ai-core..."
	cd ai-core && npm install
	@echo "📦 Installing test deps..."
	cd tests/e2e && npm install
	@echo "✅ All installed!"

dev: ## Avvia tutto in sviluppo (usa concurrently se installato)
	@echo "🚀 Starting all services..."
	make docker-up
	@(trap 'kill 0' INT; make dev-backend & make dev-frontend & make dev-mobile & wait)

dev-frontend: ## Solo frontend
	cd frontend && npm run dev

dev-backend: ## Solo backend
	cd backend && npm run dev

dev-mobile: ## Solo mobile
	cd mobile && npm run dev

build: ## Build produzione tutti i progetti
	cd frontend && npm run build
	cd mobile && npm run build
	cd backend && npm run build

test: ## Test unitari + integration
	cd backend && npm test
	cd tests/integration && npm test

test-e2e: ## Test end-to-end Playwright
	cd tests/e2e && npx playwright test

test-load: ## Load test k6
	k6 run tests/performance/load-test.js

docker-up: ## Avvia Docker stack
	docker compose up -d

docker-down: ## Ferma Docker stack
	docker compose down

status: ## Stato servizi
	@echo "🐳 Docker services:"
	docker compose ps
	@echo ""
	@echo "🔌 Porte locali:"
	@ss -tuln 2>/dev/null | grep -E ':(3001|5173|5174|5432|6379|9000|9001|1025|8025|5050|5540)' || true

logs: ## Log in tempo reale
	docker compose logs -f

clean: ## Pulizia completa
	docker compose down -v
	rm -rf frontend/node_modules backend/node_modules mobile/node_modules ai-core/node_modules
	rm -rf frontend/dist backend/dist mobile/dist
	find . -name ".DS_Store" -delete

update: ## Aggiorna dipendenze
	cd frontend && npx npm-check-updates -u && npm install
	cd backend && npx npm-check-updates -u && npm install
	cd mobile && npx npm-check-updates -u && npm install
	cd ai-core && npx npm-check-updates -u && npm install

check: ## Verifica Codespace readiness
	@bash scripts/codespace-check.sh
