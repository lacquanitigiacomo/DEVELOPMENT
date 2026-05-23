# ═══════════════════════════════════════════════════════════════
# RYB v20.0 — Zero-Stress Makefile
# Clone → make start → Done. Zero configuration.
# ═══════════════════════════════════════════════════════════════

.PHONY: help start install dev dev-frontend dev-backend dev-mobile dev-ai build test test-e2e test-load docker-up docker-down status logs clean update check

help: ## Mostra tutti i comandi
	@echo "🚀 RYB v20.0 — Zero-Stress Commands"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  [36m%-18s[0m %s
", $$1, $$2}'

start: ## 🎯 Avvio ZERO-STRESS: installa, configura, avvia tutto
	@echo "🚀 RYB Zero-Stress Start..."
	@bash ryb-start.sh

install: ## 📦 Installa dipendenze tutti i progetti
	@echo "📦 Installing all projects..."
	@for dir in frontend backend mobile ai-core tests/e2e; do 		if [ -d "$$dir" ] && [ -f "$$dir/package.json" ]; then 			echo "  → $$dir"; 			(cd "$$dir" && npm install --silent) || true; 		fi 	done
	@echo "✅ All installed!"

dev: ## 🚀 Avvia tutto in sviluppo (Docker + 4 servizi)
	@make docker-up
	@sleep 10
	@(trap 'kill 0' INT; 		make dev-backend & 		make dev-ai & 		make dev-frontend & 		make dev-mobile & 		wait)

dev-frontend: ## ⚛️ Solo frontend
	@cd frontend && npm run dev

dev-backend: ## 🖥️ Solo backend
	@cd backend && npm run dev

dev-mobile: ## 📱 Solo mobile
	@cd mobile && npm run dev

dev-ai: ## 🤖 Solo AI Core
	@cd ai-core && npm run dev

build: ## 🔨 Build produzione
	@cd frontend && npm run build
	@cd mobile && npm run build
	@cd backend && npm run build

test: ## 🧪 Test unitari + integration
	@cd backend && npm test
	@cd tests/integration && npm test

test-e2e: ## 🎭 Test end-to-end Playwright
	@cd tests/e2e && npx playwright test

test-load: ## ⚡ Load test k6
	@k6 run tests/performance/load-test.js

docker-up: ## 🐳 Avvia Docker stack
	@docker compose up -d

docker-down: ## 🐳 Ferma Docker stack
	@docker compose down

status: ## 📊 Stato servizi
	@echo "🐳 Docker:"
	@docker compose ps 2>/dev/null || echo "  Docker non disponibile"
	@echo ""
	@echo "🔌 Porte:"
	@for port in 3001 3002 5173 5174 5432 6379 9000; do 		if ss -tuln 2>/dev/null | grep -q ":$$port "; then 			echo "  ✅ $$port"; 		else 			echo "  ❌ $$port"; 		fi 	done

logs: ## 📜 Log in tempo reale
	@docker compose logs -f

clean: ## 🧹 Pulizia completa
	@docker compose down -v 2>/dev/null || true
	@rm -rf frontend/node_modules backend/node_modules mobile/node_modules ai-core/node_modules
	@rm -rf frontend/dist backend/dist mobile/dist
	@find . -name ".DS_Store" -delete
	@echo "✅ Clean done"

update: ## 🔄 Aggiorna dipendenze
	@cd frontend && npx npm-check-updates -u && npm install
	@cd backend && npx npm-check-updates -u && npm install
	@cd mobile && npx npm-check-updates -u && npm install
	@cd ai-core && npx npm-check-updates -u && npm install

check: ## 🔍 Verifica Codespace readiness
	@bash scripts/codespace-check.sh
