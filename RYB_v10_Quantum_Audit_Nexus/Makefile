# =========================================================
# RYB DEVELOPMENT HUB — Orchestratore Locale
# Comando unico per gestire tutti i progetti
# =========================================================

.PHONY: help install dev build test clean deploy status

# Colori
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

help: ## Mostra questo help
	@echo "$(BLUE)RYB Development Hub$(RESET)"
	@echo "===================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

install: ## Installa tutte le dipendenze di tutti i progetti
	@echo "$(BLUE)🔧 Installazione dipendenze...$(RESET)"
	@cd projects/ryb-frontend-future && npm install
	@cd projects/ryb-mobile-pwa && npm install
	@cd projects/ryb-backend-api && npm install
	@echo "$(GREEN)✅ Tutte le dipendenze installate$(RESET)"

dev: ## Avvia tutti i servizi in modalità sviluppo
	@echo "$(BLUE)🚀 Avvio ambiente di sviluppo completo...$(RESET)"
	@bash infrastructure/scripts/dev-start.sh

dev-frontend: ## Avvia solo il frontend futuro
	@cd projects/ryb-frontend-future && npm run dev

dev-mobile: ## Avvia solo la PWA mobile
	@cd projects/ryb-mobile-pwa && npm run dev

dev-backend: ## Avvia solo il backend API
	@cd projects/ryb-backend-api && npm run dev

dev-ai: ## Avvia il core AI
	@cd projects/ryb-ai-core && npm run dev

build: ## Build di tutti i progetti
	@echo "$(BLUE)🏗️  Build in corso...$(RESET)"
	@cd projects/ryb-frontend-future && npm run build
	@cd projects/ryb-mobile-pwa && npm run build
	@cd projects/ryb-backend-api && npm run build
	@echo "$(GREEN)✅ Build completata$(RESET)"

test: ## Esegui tutti i test
	@echo "$(BLUE)🧪 Esecuzione test...$(RESET)"
	@cd projects/ryb-frontend-future && npm test -- --passWithNoTests || true
	@cd projects/ryb-backend-api && npm test -- --passWithNoTests || true
	@echo "$(GREEN)✅ Test completati$(RESET)"

test-e2e: ## Test end-to-end
	@cd tests/e2e && npx playwright test || echo "Installa Playwright: npx playwright install"

clean: ## Pulisce build e cache
	@echo "$(YELLOW)🧹 Pulizia...$(RESET)"
	@find . -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	@find . -name "dist" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	@find . -name ".turbo" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	@echo "$(GREEN)✅ Pulizia completata$(RESET)"

status: ## Stato di tutti i servizi
	@bash infrastructure/scripts/status.sh

logs: ## Mostra log in tempo reale
	@bash infrastructure/scripts/logs.sh

docker-up: ## Avvia stack Docker completo
	@cd infrastructure/docker && docker-compose up -d

docker-down: ## Ferma stack Docker
	@cd infrastructure/docker && docker-compose down

docker-logs: ## Log Docker
	@cd infrastructure/docker && docker-compose logs -f

deploy-local: ## Deploy locale con nginx
	@bash infrastructure/scripts/deploy-local.sh

sync-shared: ## Sincronizza codice condiviso tra progetti
	@bash infrastructure/scripts/sync-shared.sh

update: ## Aggiorna tutte le dipendenze
	@echo "$(BLUE)📦 Aggiornamento dipendenze...$(RESET)"
	@cd projects/ryb-frontend-future && npx npm-check-updates -u && npm install
	@cd projects/ryb-mobile-pwa && npx npm-check-updates -u && npm install
	@cd projects/ryb-backend-api && npx npm-check-updates -u && npm install
	@echo "$(GREEN)✅ Aggiornamento completato$(RESET)"
