# RYB v10.0 Quantum Audit Nexus

## 🎯 Missione

RYB (Are You Broke?) è l'**audit finanziario potenziato dall'AI** che si adatta a qualsiasi dispositivo — dal MacBook Pro al telefono Android economico.

**Zero costi, zero dipendenze da servizi a pagamento.**

## 🚀 Quick Start

```bash
# 1. Installa tutto
make install

# 2. Avvia infrastruttura (DB, Redis, MinIO, MailHog)
make docker-up

# 3. Avvia tutti i servizi
make dev
```

## 🧠 Hardware Adaptive AI

RYB rileva automaticamente le capacità del tuo dispositivo e sceglie la strategia AI ottimale:

| Score | Strategia | Descrizione |
|-------|-----------|-------------|
| 70-100 | `local-llm` | Ollama 7B+ — analisi approfondita offline |
| 50-69 | `local-small` | Ollama 3B — buon bilancio velocità/qualità |
| 30-49 | `hybrid` | Regole locali + cloud gratuita |
| 15-29 | `cloud-free` | HuggingFace / Groq free tier |
| 0-14 | `rule-only` | Analisi rule-based — istantaneo, zero dipendenze |

**Su Mac con poca RAM:** RYB usa `rule-only` o `cloud-free` — mai Ollama se non c'è potenza.

## 📋 Flusso Utente

1. **Registrazione** → Crea account
2. **Onboarding** → Risponde a 3 domande:
   - Quale CCNL hai a lavoro?
   - Hai i files delle buste paga?
   - Hai degli orari comunicati?
3. **Dashboard** → Panoramica e stato audit
4. **Audit Busta Paga** → Carica busta paga + orari → AI verifica correttezza
5. **Report** → Esporta discrepanze e suggerimenti

## 🏗️ Struttura

```
RYB/
├── frontend/          React 19 + Vite 6 + Tailwind (fix Node 24)
├── backend/           Express + TypeScript + JWT + PostgreSQL
├── mobile/            PWA offline-ready (Vite + React)
├── ai-core/           Hardware Adaptive Engine (Ollama / HF / Rules)
├── shared/            Types & utils TypeScript
├── tests/             Playwright E2E + Jest + k6
├── infrastructure/    Docker, scripts, nginx
├── docs/              OpenAPI, architecture, deployment
└── monitoring/        Prometheus + Grafana
```

## 🌐 Porte

| Service | Porta | Descrizione |
|---------|-------|-------------|
| Frontend | 5173 | UI principale |
| Mobile | 5174 | PWA mobile |
| API | 3001 | Backend Express |
| AI Core | 3002 | Engine AI adattivo |
| PostgreSQL | 5432 | Database |
| Redis | 6379 | Cache |
| MinIO | 9000/9001 | File storage |
| MailHog | 1025/8025 | Email dev |
| pgAdmin | 5050 | GUI DB |
| Redis Insight | 5540 | GUI Cache |

## 🧪 Test

```bash
make test        # Unit + integration
make test-e2e    # Playwright (5 browser)
make test-load   # k6 performance
make check       # Verifica Codespace readiness
```

## 🐳 Docker

```bash
make docker-up    # Avvia stack
make docker-down  # Ferma
make status       # Stato servizi
make logs         # Log in tempo reale
```

## 🔒 Zero-Cash Strategy

| Feature | Soluzione | Fallback |
|---------|-----------|----------|
| AI Text | Ollama locale | HuggingFace free → Rule-based |
| AI OCR | Tesseract.js | Rule-based pattern matching |
| Auth | JWT self-hosted | — |
| Storage | MinIO Docker | Local filesystem |
| Email | MailHog dev | Gmail SMTP (utente configura) |
| Maps | OpenStreetMap | Leaflet offline |
| Monitoring | Prometheus + Grafana | — |

## 📦 Release Roadmap

- ✅ **v10.0** — Core + Hardware Adaptive AI + CCNL/Payslip flow
- **v10.1** — Fix Vite/Node 24, Codespace check
- **v10.2** — PWA offline completa
- **v10.3** — AI Core agents avanzati
- **v10.4** — Backend auth + API complete
- **v10.5** — Test suite 100%
- **v10.6** — Monitoring dashboard
- **v10.7** — Shared types strict
- **v10.8** — Docker hot-reload
- **v10.9** — OpenAPI docs complete
- **v11.0** — Stable release, CI/CD

---
**Build:** v10.0.0 | **Date:** 2026-05-23 | **Status:** 🟢 Ready | **Cost:** €0.00
