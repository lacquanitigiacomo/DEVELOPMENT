# PROPOSTA REFACTOR — RYB v20 (Future Interface & Intelligence Roadmap)

## 1) Obiettivo
Evolvere RYB v20 in una piattaforma **innovativa, elegante e funzionale** per:
- analisi incrociata di **buste paga**,
- **pattern orari** e turnazioni,
- **calendario** e festività,
- estrazione dati da **PDF orari**,
- confronto con **badge/timbrature**,
- revisione fiscale/finanziaria con evidenze visive e spiegazioni verificabili.

---

## 2) Interfaccia proposta (UX/UI)

### Palette principale (richiesta)
- **Grigio**: base neutra enterprise (sfondi, superfici)
- **Blu/Azzurro**: azioni principali, info affidabili, trend positivi
- **Arancio/Giallo**: warning, anomalie, aree da verificare

### Architettura UX (flusso)
1. **Accesso**: login/registrazione/social + accesso ospite demo
2. **Contratto**: selezione CCNL o upload contratto
3. **Data Hub**: upload busta paga, orari PDF, badge/timbrature, calendario
4. **Motore confronto**: matching dati e regole CCNL
5. **Revisione**: dashboard con highlights, errori, impatti economici
6. **Azione**: report contestazione/recupero con prova documentale

### Componenti visuali chiave
- Timeline mensile anomalie
- Heatmap orari/straordinari/notturni
- Tabella differenze “atteso vs pagato”
- Score di rischio retributivo e fiscale
- Pannello “prove” con evidenze tracciabili

---

## 3) Motore di analisi incrociata (data fusion)

### Input normalizzati
- Buste paga (PDF, OCR)
- Orari dichiarati (PDF/CSV/XLS)
- Badge/timbrature (CSV/API)
- Calendario lavoro (turni, ferie, festività)
- Contratto CCNL (regole, maggiorazioni, minimi)

### Pipeline tecnica
1. **Ingestion** → upload + validazione
2. **Extraction** → OCR + parsing semantico
3. **Normalization** → schema unico eventi lavoro/paga
4. **Reconciliation** → matching ore/causali/importi
5. **Rule Engine** → controllo regole CCNL/fiscali
6. **Explainability** → motivazione ogni anomalia
7. **Output** → dashboard + report + API

---

## 4) Refactor architetturale consigliato

### Frontend
- Feature-based routing (`features/auth`, `features/contracts`, `features/review`)
- Design system con token (palette, spaziature, stati)
- Stato con store modulare (sessione, uploads, findings)
- Lazy loading dashboard/grafici pesanti

### Backend
- Moduli separati: `ingestion`, `ocr`, `reconciliation`, `rules`, `reports`
- Event-driven jobs per parsing pesanti (queue)
- Audit trail versionato di input/output
- API versionate (`/api/v2/...`) con contratti OpenAPI

### Data layer
- Schema “facts/events” (timesheet_fact, payroll_fact, discrepancy_fact)
- Storage oggetti per documenti originali + hash integrità
- Snapshot mensili per confronti storici

---

## 5) 30 funzionalità innovative (prossime release)

> Ogni item include area di impatto e metrica valutabile.

1. **Smart CCNL Auto-Classifier** (BE/AI) — identifica contratto da busta; KPI: accuratezza %
2. **Explainable Discrepancy Cards** (FE/BE) — ogni errore con “perché”; KPI: riduzione ticket supporto
3. **Multi-source Timeline Merge** (BE) — unione eventi badge+orari+busta; KPI: match coverage
4. **Notturni/Festivi Detector** (BE) — rileva ore speciali; KPI: recall su casi reali
5. **Maggiorazioni Simulator** (FE/BE) — simula paga attesa; KPI: delta medio rilevato
6. **Payroll Digital Twin** (BE) — ricostruzione virtuale busta; KPI: scarto vs reale
7. **Contract Gap Analyzer** (BE) — mancanze documentali; KPI: completezza dossier
8. **Anomaly Heatmap Calendar** (FE) — calendario anomalie; KPI: tempo medio diagnosi
9. **Badge Integrity Check** (BE) — anti-manomissione timbrature; KPI: incidenti trovati
10. **Shift Pattern Intelligence** (AI) — pattern turni anomali; KPI: precision alert
11. **Overtime Fairness Index** (BE/AI) — equità straordinari; KPI: indice per team/reparto
12. **Fiscale Withholding Validator** (BE) — verifica trattenute; KPI: anomalie fiscali/mese
13. **INPS/INAIL Consistency Check** (BE) — coerenza contributi; KPI: mismatch rate
14. **Smart Evidence Pack** (BE) — dossier contestazione auto; KPI: tempo preparazione pratica
15. **One-click PEC/Email Draft** (BE/INTEG) — bozza invio formale; KPI: completion rate
16. **Negotiation Assistant** (AI) — suggerimenti trattativa datore; KPI: recupero economico medio
17. **Recovery Forecast** (AI) — stima recuperabile 3/6/12 mesi; KPI: errore previsione
18. **Compliance Score** (BE) — score compliance azienda; KPI: trend score trimestrale
19. **Scenario What-if Engine** (FE/BE) — cambi orario/contratto; KPI: uso simulazioni
20. **OCR Confidence Overlay** (FE) — confidence per campo estratto; KPI: correzioni manuali
21. **Human-in-the-loop Review** (FE/BE) — validazione guidata; KPI: qualità dato finale
22. **Fraud Pattern Library** (AI/BE) — libreria pattern ricorrenti; KPI: nuovi pattern/mese
23. **Cross-month Drift Detection** (AI) — derive progressive; KPI: detection early-warning
24. **Team Benchmarking (anonimizzato)** (BE) — confronto tra profili simili; KPI: insight utili/sessione
25. **Natural Language Audit Query** (AI/FE) — “mostrami errori notturni aprile”; KPI: task completion
26. **Voice Summary Report** (FE/AI) — sintesi vocale risultati; KPI: engagement report
27. **Regulatory Auto-Update Service** (BE/SVC) — aggiornamento regole CCNL/fiscali; KPI: latenza update
28. **API Connector Hub** (BE/INTEG) — HRIS, badge, payroll software; KPI: connettori attivi
29. **Evidence Blockchain Hashing (opz.)** (BE) — notarizzazione hash prove; KPI: verifiche riuscite
30. **Personal Financial Shield** (FE/AI) — priorità interventi economici personali; KPI: risparmio annuo stimato

---

## 6) Backlog tecnico eseguibile (code/services/api)

### Cambi codice prioritari
- Refactor frontend in moduli feature
- Introduzione `RuleEngine` backend con regole pluggable
- Introduzione `DiscrepancyDTO` unico FE/BE
- Logging strutturato con correlation-id per audit

### Servizi/API da inserire
- OCR avanzato (provider astratto + fallback locale)
- Queue jobs (BullMQ/Rabbit) per parsing asincrono
- Connector API per badge/HR/payroll
- Notification service (email/PEC templates)

### Nuove API suggerite
- `POST /api/v2/ingest/payroll`
- `POST /api/v2/ingest/timesheet`
- `POST /api/v2/ingest/badge`
- `POST /api/v2/reconcile/run`
- `GET /api/v2/reconcile/:runId/findings`
- `GET /api/v2/reports/:runId/evidence-pack`

---

## 7) Roadmap proposta

### Release R21 (fondazioni)
- Normalizzazione dati + dashboard discrepanze base
- Accesso ospite + flusso contratti migliorato

### Release R22 (intelligence)
- Rule engine completo + explainability
- Simulatore maggiorazioni + forecasting recuperi

### Release R23 (ecosistema)
- Connector hub esterni
- Evidence pack professionale + automazioni invio

---

## 8) KPI di successo prodotto
- % anomalie corrette dall’utente
- Recupero economico medio per pratica
- Tempo medio da upload a report finale
- Accuratezza estrazione OCR per campo
- Riduzione contestazioni non documentate

---

## 9) Nota operativa
Questa proposta è pensata per essere **valutabile, iterativa e implementabile**:
- ogni feature ha impatto tecnico chiaro,
- ogni release ha obiettivi misurabili,
- ogni evoluzione può essere tracciata con metriche reali.
