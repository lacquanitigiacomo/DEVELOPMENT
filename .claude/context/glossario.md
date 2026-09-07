# Glossario

> Nomi propri dei progetti. Serve perché una sessione nuova non ha idea di cosa
> significhino sigle e nomi in codice.

---

## SmartSL

❓ **DA DOCUMENTARE.** Nominato dall'utente il 2026-09-07 come oggetto di lavoro,
ma non compare in nessun file di nessuno dei due repo (`grep -ri "smartsl"` → 0 risultati).
Il nome appare solo nel branch di sessione `claude/smartsl-connection-cxhcui`, generato
automaticamente e quindi non informativo.

Riferimento fornito: un reel Instagram, non apribile dalle sessioni web perché il
dominio è bloccato dalla network policy dell'ambiente.

**Da chiarire:** cos'è, a cosa serve, dove vive (repo esistente? progetto nuovo?
servizio di terzi da integrare?), a che punto è.

## RYB — v20 "Quantum Audit Nexus / Zero Stress"

Piattaforma di analisi incrociata del rapporto di lavoro: buste paga, pattern orari e
turnazioni, calendario e festività, estrazione dati da PDF orari, confronto con
badge/timbrature, revisione fiscale con evidenze visive verificabili.

Filosofia dichiarata **"Clone. Launch. Done."**: zero configurazione manuale. Il cuore
è `shared/env-engine.ts`, che risolve le variabili d'ambiente a cascata
(`.env` → `.env.example` → smart defaults generati in memoria) e auto-rileva il contesto
di esecuzione (Codespaces / Docker / locale / Mac con poca RAM). L'utente non deve mai
creare un `.env` a mano. Vincolo **zero-cash**: ogni servizio ha un fallback gratuito
(Ollama → HuggingFace free → rule-based; Tesseract.js per l'OCR; MinIO per lo storage).

Stack: Express + React 19 + PWA mobile + ai-core, Postgres/Redis/MinIO in Docker,
Prometheus + Grafana per il monitoring.

## X-PAY CHECK

Progetto parallelo a RYB, struttura di cartelle quasi identica (stesso `ryb-start.sh`,
stesso Makefile, presenza di un `backend-legacy`). Ha una sua spec frontend dedicata
(`X-PAY-CHECK_frontend_spec.md`). **Rapporto con RYB da chiarire**: evoluzione, fork,
rebrand o esperimento accantonato.

## OSTERIE

Gioco, in un repo separato (`lacquanitigiacomo/osterie`). Vedi il `CLAUDE.md` di quel repo.

## CCNL

Contratto Collettivo Nazionale di Lavoro. È il riferimento normativo contro cui RYB
confronta i dati estratti da buste paga e timbrature.
