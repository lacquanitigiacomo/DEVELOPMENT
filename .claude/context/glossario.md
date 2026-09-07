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

## Carmy — da skill ad agente proattivo

Attualmente esiste come **skill** (`carmy`): cucina di alta qualità ispirata alla mentalità
di Carmy di The Bear — tecnica ossessiva, creatività istintiva, rispetto totale per la
materia prima. Copre cucina italiana regionale, fine dining, pasta fresca, lievitati,
fermentazione, cotture avanzate, e la conoscenza degli strumenti (planetaria, roner,
friggitrice ad aria, forno a vapore, pacojet).

**Obiettivo dichiarato dall'utente (2026-09-07): trasformarla in un agente AI proattivo.**
Non più una skill che risponde quando interrogata, ma un agente che anticipa — presumibilmente
su dispensa, stagionalità, pianificazione dei pasti, gestione degli avanzi.

Da definire: cosa significa "proattivo" nel concreto (cosa osserva, con che frequenza,
come e quando interviene), dove gira, con che dati. **Progetto da impostare, non ancora avviato.**

## RYB — v20 "Quantum Audit Nexus / Zero Stress"  ⚠️ SUPERATO

**Decisione 2026-09-07: X-PAY CHECK ha sostituito RYB.** Stesso prodotto, stadio successivo.
RYB resta solo come storico: non riceve piu' sviluppo e non avra' un repo proprio.
Quanto segue descrive il prodotto, che vale ancora per X-PAY CHECK.


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

**Il progetto attivo della linea.** Ha sostituito RYB (decisione 2026-09-07): stesso
prodotto, stadio successivo. Struttura di cartelle quasi identica a RYB (stesso `ryb-start.sh`,
stesso Makefile, presenza di un `backend-legacy`). Ha una sua spec frontend dedicata
(`X-PAY-CHECK_frontend_spec.md`). Destinato a diventare un repo autonomo.

## OSTERIE

Gioco, in un repo separato (`lacquanitigiacomo/osterie`). Vedi il `CLAUDE.md` di quel repo.

## CCNL

Contratto Collettivo Nazionale di Lavoro. È il riferimento normativo contro cui RYB
confronta i dati estratti da buste paga e timbrature.
