# RYB v20.0 Quantum Audit Nexus — Zero-Stress Edition

## 🎯 Filosofia: "Clone. Launch. Done."

```bash
git clone <repo>
cd RYB_v20_Zero_Stress
make start
```

**Zero configurazione manuale. Zero file nascosti da creare. Zero stress.**

## 🚀 Avvio Rapido

### Opzione 1: One-command (consigliata)
```bash
make start
```

### Opzione 2: Passo dopo passo
```bash
make install      # Installa dipendenze
make docker-up    # Avvia DB, Redis, MinIO
make dev          # Avvia tutti i servizi
```

## 🧠 Zero-Stress Environment Engine

L'app gestisce automaticamente le variabili d'ambiente in cascata:

```
Livello 1: .env (personalizzato) → se esiste, usa quello
Livello 2: .env.example (default)  → se .env manca, carica i default
Livello 3: generated (in-memory)   → se anche .env.example manca, genera smart defaults
```

**L'utente NON deve mai creare un file .env a mano.**

### Auto-detection ambiente
- **Codespaces** → CORS aperto, URL pubblici automatici
- **Docker** → Host interni (postgres, redis, minio)
- **Locale** → localhost standard
- **Mac con poca RAM** → AI rule-based (mai Ollama se non c'è potenza)

## 🏗️ Struttura v20

```
RYB/
├── ryb-start.sh           ← 🚀 Launcher zero-stress (uno script, tutto fatto)
├── Makefile               ← Comandi unificati
├── .env.example           ← Default pubblico (sincronizzabile su GitHub)
├── .gitignore             ← .env ignorato, .env.example incluso
├── shared/
│   └── env-engine.ts      ← 🧠 Cuore della filosofia zero-stress
├── backend/               ← Express + Zero-Stress Env
├── frontend/              ← React 19 + Auto-API detection
├── mobile/                ← PWA offline
├── ai-core/               ← Hardware Adaptive + Zero-Stress Env
├── tests/                 ← E2E + Integration + Performance
├── infrastructure/        ← Docker, scripts, nginx
├── docs/                  ← OpenAPI, architecture
└── monitoring/            ← Prometheus + Grafana
```

## 🌐 Porte

| Service | Porta | URL Codespaces |
|---------|-------|----------------|
| Frontend | 5173 | `https://<codespace>-5173.github.dev` |
| Mobile | 5174 | `https://<codespace>-5174.github.dev` |
| API | 3001 | `https://<codespace>-3001.github.dev` |
| AI Core | 3002 | `https://<codespace>-3002.github.dev` |

## 🧪 Test

```bash
make test        # Unit + integration
make test-e2e    # Playwright (5 browser)
make test-load   # k6 performance
make check       # Verifica ambiente
```

## 🔒 Zero-Cash v20

| Feature | Soluzione | Fallback |
|---------|-----------|----------|
| AI Text | Ollama locale | HuggingFace free → Rule-based |
| AI OCR | Tesseract.js | Rule-based pattern matching |
| Auth | JWT self-hosted | — |
| Storage | MinIO Docker | Filesystem locale |
| Email | MailHog dev | Gmail SMTP (utente configura) |
| Monitoring | Prometheus + Grafana | — |

## 📦 Evoluzione v10 → v20

| Versione | Novità |
|----------|--------|
| v10.0 | Core + Hardware Adaptive AI |
| v11.0 | Zero-Stress Env Engine |
| v12.0 | Auto-detection Codespaces/Docker/Local |
| v13.0 | In-memory fallback (senza Docker) |
| v14.0 | Smart defaults generation |
| v15.0 | Frontend auto-API URL detection |
| v16.0 | Launcher unificato `ryb-start.sh` |
| v17.0 | Healthcheck automatico post-avvio |
| v18.0 | Graceful degradation (servizi opzionali) |
| v19.0 | Logging strutturato con env source |
| **v20.0** | **"Clone. Launch. Done." — Filosofia completa** |

---
**Build:** v20.0.0 | **Date:** 2026-05-23 | **Cost:** €0.00 | **Stress:** 0%
