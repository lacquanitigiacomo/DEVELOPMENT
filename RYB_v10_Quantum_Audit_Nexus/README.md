# RYB DEVELOPMENT HUB v10.0

## 🎯 Cos'è questo hub?

Questo è il **centro di comando** per lo sviluppo locale di RYB (Are You Broke?).
Qui orchestrhi tutti i progetti, i test, le build e il deploy.

## 📁 Struttura

```
RYB-DEVELOPMENT-HUB/
├── Makefile                    ← Comando unico per tutto
├── projects/
│   ├── ryb-frontend-future/    ← UI/UX radicale (React + Vite)
│   ├── ryb-mobile-pwa/         ← App mobile offline (PWA)
│   ├── ryb-backend-api/        ← API server (Node + Express)
│   └── ryb-ai-core/            ← Core AI agents
├── infrastructure/
│   ├── docker/
│   │   ├── docker-compose.yml  ← PostgreSQL + Redis + MinIO
│   │   └── init/               ← Script SQL inizializzazione
│   ├── scripts/
│   │   ├── dev-start.sh        ← Avvio completo ambiente
│   │   ├── status.sh           ← Stato servizi
│   │   └── sync-shared.sh      ← Sincronizza codice condiviso
│   └── nginx/
│       └── nginx.conf          ← Reverse proxy locale
├── tests/
│   ├── e2e/                    ← Playwright tests
│   ├── integration/            ← API integration tests
│   └── performance/            ← Load tests
├── shared/
│   ├── types/                  ← TypeScript types condivisi
│   ├── utils/                  ← Utility condivise
│   └── assets/                 ← Asset condivisi
├── docs/
│   ├── architecture/           ← Diagrammi architetturali
│   ├── api/                    ← Documentazione API
│   └── deployment/             ← Guide deploy
└── monitoring/                 ← Dashboard monitoraggio
```

## 🚀 Quick Start

### 1. Prerequisiti
```bash
# Verifica che tutto sia installato
node -v    # >= 20.0.0
npm -v     # >= 10.0.0
docker -v  # >= 24.0.0
git -v
```

### 2. Clona/estrai
```bash
cd RYB-DEVELOPMENT-HUB
```

### 3. Installa tutto
```bash
make install
```

### 4. Avvia infrastruttura (database, cache)
```bash
make docker-up
```

### 5. Avvia tutti i servizi
```bash
make dev
```

### 6. Apri nel browser
- **Frontend:** http://localhost:5173
- **Mobile:** http://localhost:5174
- **API:** http://localhost:3001
- **pgAdmin:** http://localhost:5050
- **Redis Insight:** http://localhost:5540

## 📋 Comandi Makefile

| Comando | Descrizione |
|---------|-------------|
| `make help` | Mostra tutti i comandi |
| `make install` | Installa dipendenze tutti progetti |
| `make dev` | Avvia tutto in sviluppo |
| `make dev-frontend` | Solo frontend |
| `make dev-mobile` | Solo mobile |
| `make dev-backend` | Solo backend |
| `make build` | Build produzione |
| `make test` | Test suite |
| `make test-e2e` | Test end-to-end |
| `make docker-up` | Avvia Docker stack |
| `make docker-down` | Ferma Docker stack |
| `make status` | Stato servizi |
| `make logs` | Log in tempo reale |
| `make clean` | Pulizia completa |
| `make update` | Aggiorna dipendenze |

## 🐳 Docker Services

| Service | Porta | Descrizione |
|---------|-------|-------------|
| PostgreSQL | 5432 | Database principale |
| Redis | 6379 | Cache + job queue |
| MinIO | 9000/9001 | Object storage S3 |
| MailHog | 1025/8025 | Email testing |
| pgAdmin | 5050 | GUI PostgreSQL |
| Redis Insight | 5540 | GUI Redis |

## 🔧 Configurazione Database

```yaml
Host: localhost
Port: 5432
Database: ryb_development
User: ryb_dev
Password: ryb_dev_secret_2026
```

## 🧪 Testing

```bash
# Test unitari
make test

# Test end-to-end (richiede Playwright)
cd tests/e2e
npx playwright install
npx playwright test

# Test performance
k6 run tests/performance/load-test.js
```

## 📦 Aggiungere un nuovo progetto

1. Crea cartella in `projects/nome-progetto/`
2. Aggiungi target in `Makefile`
3. Aggiorna `infrastructure/scripts/dev-start.sh`
4. Aggiungi test in `tests/`

## 🔒 Sicurezza

- Tutti i secret sono in `.env` (non committato)
- Database isolato in Docker
- Nessun dato lascia il localhost in dev
- HTTPS in produzione con certificati auto-generati

## 📚 Documentazione

- `docs/architecture/` — Diagrammi C4, ADR
- `docs/api/` — OpenAPI specs
- `docs/deployment/` — Guide per ogni ambiente

---

**Build:** v10.0.0 | **Date:** 2026-05-23 | **Status:** 🟢 Ready
