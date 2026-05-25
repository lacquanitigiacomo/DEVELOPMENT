# RYB Mobile — Technical Specification v1.0
## "Quantum Audit Nexus" — Standalone Mobile Edition
**Data:** 2026-05-25 | **Stato:** Draft per review settoriale | **Costo target:** €0.00 infrastruttura

---

## 0. Glossario & Principi Architetturali

| Termine | Significato |
|---------|-------------|
| **Agente Revisore** | Sistema ibrido (rule engine + LLM locale) che analizza cedolini |
| **ARCHIVIO CCNL** | Repository di file `.md` contenenti regole contrattuali parametrizzate |
| **ARCHIVIO UPDATES** | Changelog e patch normative per aggiornare l'agente |
| **ARCHIVIO NOZIONI** | Knowledge base commercialistica (IRPEF, contributi, TFR, ecc.) |
| **Profilo Revisore** | Pacchetto di knowledge scaricato dall'app in background |
| **On-Device** | Tutti i dati sensibili (buste paga, badge, calendario) restano nel device |
| **Zero-Knowledge Server** | Il server conosce solo: email, hash licenza, metadati anonimizzati |

**Principi non negoziabili:**
1. Privacy totale: nessun dato sensibile lascia il device.
2. Offline-first: l'app funziona senza internet dopo il primo setup.
3. Aggiornamenti knowledge: solo il "profilo revisore" viaggia in rete.
4. One user, one device: massimizzazione installazioni.

---

## 1. Rule Engine — Schema e Flusso di Audit

### 1.1 Struttura del motore

Il rule engine è un **grafo diretto aciclico (DAG)** di regole deterministiche. Ogni nodo è una regola; ogni arco è una dipendenza di dato.

```
Cedolino OCR (raw text)
    ↓
[Parser] → Estrazione campi strutturati (JSON)
    ↓
[Classificatore CCNL] → Identifica contratto (auto o manuale)
    ↓
[Rule Engine DAG] → Valutazione sequenziale + parallela
    ↓
[Risultato Audit] → JSON con flag + delta + segnalazioni
    ↓
[LLM Locale] → Narrativa discorsiva (solo Pro)
```

### 1.2 Estrazione campi (Parser)

Il parser OCR restituisce un oggetto `CedolinoRaw`:

```json
{
  "mese_riferimento": "2026-04",
  "tipo_documento": "cedolino",
  "dati_testuali": {
    "ragione_sociale": "ACME SRL",
    "p_iva": "12345678901",
    "cf_lavoratore": "RSSMRA85M01H501Z",
    "ccnl_applicato": "COMMERCIO",
    "livello": "5",
    "qualifica": "IMPIEGATO"
  },
  "dati_numerici": {
    "giorni_lavorati": 22,
    "ore_ordinarie": 176,
    "ore_straordinarie": 10,
    "ore_notturne": 8,
    "ore_festive": 4,
    "paga_base": 1450.00,
    "scatti_anzianita": 120.00,
    "superminimo": 0.00,
    "lordo": 1850.00,
    "netto": 1380.00,
    "trattamento_integrativo": 50.00,
    "irpef": 320.00,
    "addizionale_regionale": 25.00,
    "addizionale_comunale": 15.00,
    "contributi_inps_dipendente": 185.00,
    "contributi_inail": 5.00,
    "tfr_maturato": 45.50,
    "ferie_maturate_gg": 2.50,
    "ferie_usate_gg": 0.00,
    "rol_maturati_gg": 0.83,
    "rol_usati_gg": 0.00,
    "maggiorazione_notturna": 45.00,
    "maggiorazione_festiva": 32.00,
    "maggiorazione_straordinaria": 80.00
  },
  "assenze": {
    "malattia_gg": 0,
    "ferie_gg": 0,
    "rol_gg": 0,
    "maternita_gg": 0,
    "cassa_integrazione_gg": 0
  }
}
```

### 1.3 DAG delle Regole

#### Livello 1 — Regole Matematiche Base (sempre eseguite)

| ID | Nome | Formula / Logica | Severità |
|----|------|-------------------|----------|
| `R001` | Coerenza Lordo-Netto | `netto_calcolato = lordo - irpef_tot - addizionali - inps_dip - inail` | 🔴 CRITICO |
| `R002` | IRPEF Aliquota | Verifica se `irpef / (lordo - deducibili)` rientra in scaglioni 2026 | 🟡 WARNING |
| `R003` | Contributi INPS % | `inps_dip / paga_imponibile` deve essere ~9.19% (dipendente) | 🟡 WARNING |
| `R004` | TFR Maturato | `TFR = (lordo - ex_fondo) / 13.5 * (giorni_lavorati / 365)` | 🟡 WARNING |
| `R005` | Congruenza Giorni | `giorni_lavorati + malattia + ferie + ... = giorni_mese` | 🔴 CRITICO |

#### Livello 2 — Regole CCNL Dipendenti (richiede `ccnl_applicato`)

| ID | Nome | Input dal CCNL `.md` | Severità |
|----|------|----------------------|----------|
| `R101` | Paga Base Minima | `paga_base >= minimo_tabellare[livello]` | 🔴 CRITICO |
| `R102` | Scatti Anzianità | `scatti = quota * anni_servizio` (verifica coerenza) | 🟡 WARNING |
| `R103` | Maggiorazione Notturna | Se `ore_notturne > 0` → verifica `% maggiorazione` e calcolo | 🟡 WARNING |
| `R104` | Maggiorazione Festiva | Se `ore_festive > 0` → verifica festività del mese + % | 🟡 WARNING |
| `R105` | Straordinari 25%/50% | Verifica se `ore_straordinarie` sono maggiorate correttamente | 🟡 WARNING |
| `R106` | Ferie Maturazione | `ferie_maturate = (giorni_lavorati / 26) * ferie_annuali / 12` | 🟡 WARNING |
| `R107` | ROL Maturazione | `rol_maturati = (giorni_lavorati / 26) * rol_annuali / 12` | 🟡 WARNING |
| `R108` | Coerenza Ferie Residue | `residue_precedenti + maturate - usate = residue_attuali` | 🔴 CRITICO |
| `R109` | Coerenza ROL Residui | Stessa logica di R108 per ROL | 🔴 CRITICO |
| `R110` | Tredicesima/Quattordicesima | Verifica se mese è novembre/dicembre e rateo corretto | 🟡 WARNING |

#### Livello 3 — Regole Investigative (richiede dati esterni)

| ID | Nome | Input necessari | Severità |
|----|------|-----------------|----------|
| `R201` | Congruenza Badge-Cedolino | Confronta `ore_badge_mese` vs `ore_ordinarie + straordinarie` | 🔴 CRITICO |
| `R202` | Festività Non Maggiorate | Confronta calendario turni vs festività italiane → se lavorato, verifica maggiorazione | 🔴 CRITICO |
| `R203` | Notti Consecutive | Da calendario: se > X notti consecutive → flag (solo informativo, no medico) | 🟢 INFO |
| `R204` | Domeniche Lavorate | Conta domeniche in calendario → verifica maggiorazione in cedolino | 🟡 WARNING |
| `R205` | Ratei Mancanti | Confronto storico mese-per-mese: se manca tredicesima/quattordicesima rateo | 🔴 CRITICO |
| `R206` | Coerenza Interannuale | Confronto IRPEF mese-per-mese per anomalie (es. trattenuta doppia) | 🟡 WARNING |

### 1.4 Output del Rule Engine

```json
{
  "audit_id": "uuid",
  "timestamp": "2026-05-25T10:00:00Z",
  "ccnl": "COMMERCIO",
  "livello": "5",
  "severita_massima": "CRITICO",
  "riepilogo": {
    "totale_controlli": 24,
    "critici": 2,
    "warning": 5,
    "info": 3,
    "pass": 14
  },
  "dettaglio": [
    {
      "regola_id": "R001",
      "nome": "Coerenza Lordo-Netto",
      "stato": "PASS",
      "valore_atteso": 1380.00,
      "valore_rilevato": 1380.00,
      "delta": 0.00,
      "severita": "PASS",
      "messaggio": "Il netto calcolato coincide con il netto riportato."
    },
    {
      "regola_id": "R103",
      "nome": "Maggiorazione Notturna",
      "stato": "WARNING",
      "valore_atteso": 52.00,
      "valore_rilevato": 45.00,
      "delta": -7.00,
      "severita": "WARNING",
      "messaggio": "Ore notturne rilevate (8h) ma maggiorazione calcolata (€45) inferiore al minimo CCNL (€52). Verificare se applicata correttamente.",
      "riferimento_ccnl": "Art. 42 — Lavoro notturno",
      "suggerimento": "Controllare se le 8 ore notturne sono state retribuite con il 25% sulla media oraria."
    }
  ],
  "dati_investigativi": {
    "notti_totali_mese": 4,
    "domeniche_lavorate": 2,
    "festivita_lavorate_non_maggiorate": ["2026-04-25"],
    "ore_badge_vs_cedolino": { "badge": 184, "cedolino": 186 }
  }
}
```

---

## 2. Formato CCNL `.md` — Specifica

### 2.1 Filosofia
Ogni CCNL è un file Markdown auto-contenuto, leggibile dall'uomo e parsabile dalla macchina tramite **frontmatter YAML** + sezioni strutturate.

### 2.2 Struttura file

```markdown
---
ccnl_id: "COMMERCIO_2024"
nome: "CCNL Terziario - Commercio"
settore: "commercio"
validita_dal: "2024-01-01"
validita_al: "2026-12-31"
revisione: "3"
peso_kb_stimato: "45"
regole_totali: "12"
---

# CCNL Terziario - Commercio (2024-2026)

## Parametri Globali

| Parametro | Valore | Note |
|-----------|--------|------|
| ore_settimanali | 40 | Standard |
| giorni_ferie_annuali | 26 | Base |
| giorni_rol_annuali | 10 | Base |
| massimo_notti_consecutive | 3 | Suggerimento CCNL |
| maggiorazione_notturna | 25% | Sulla paga oraria media |
| maggiorazione_festiva | 30% | Sulla paga oraria media |
| maggiorazione_straordinario_25 | 25% | Prime 8 settimanali |
| maggiorazione_straordinario_50 | 50% | Oltre le 8 settimanali |
| contrib_inps_dip | 9.19% | Aliquota 2026 |
| contrib_inail | 0.40% | A carico dipendente |

## Minimi Tabellari

| Livello | Qualifica | Paga Base Mensile (€) | Indennità Carico (€) |
|---------|-----------|----------------------|---------------------|
| 1 | OPERAI | 1.250,00 | 50,00 |
| 2 | ADDETTI | 1.350,00 | 60,00 |
| 3 | IMPIEGATI B | 1.450,00 | 70,00 |
| 4 | IMPIEGATI A | 1.650,00 | 80,00 |
| 5 | QUADRO | 2.100,00 | 100,00 |

## Regole Ferie e ROL

### Maturazione
- **Ferie**: `(giorni_lavorati / 26) * 26 / 12` → ~2,166 gg/mese
- **ROL**: `(giorni_lavorati / 26) * 10 / 12` → ~0,833 gg/mese

### Trasferibilità
- Ferie: trasferibili fino al 31/08 anno successivo
- ROL: trasferibili fino al 31/03 anno successivo

## Maggiorazioni — Dettaglio

### Art. 42 — Lavoro Notturno
- Definizione: dalle 22:00 alle 06:00
- Calcolo: `ore_notturne * (paga_oraria_media * 1.25)`
- Se il lavoratore svolge > 3 notti consecutive, il CCNL prevede riposo compensativo

### Art. 43 — Lavoro Festivo
- Festività nazionali: 1 Gen, 6 Gen, Pasqua, 25 Apr, 1 Mag, 2 Giug, 15 Ago, 1 Nov, 8 Dic, 25 Dic, 26 Dic
- Se lavorato: `ore_festive * (paga_oraria_media * 1.30)`
- Se non maggiorato ma lavorato: segnalare CRITICO

## Assenze — Impatto

| Tipo | Giorni | Impatto Retribuzione | Impatto Contributi |
|------|--------|---------------------|-------------------|
| Malattia | ≤3 | 100% | Sì |
| Malattia | 4-20 | 50% INPS + 50% azienda | Sì |
| Maternità | Obbligatoria | 80% INPS | Sì |
| Cassa Integrazione | — | 80% INPS | Sì (sospesi) |

## Note Speciali 2026

- **Bonus Renzi**: verificare se applicato correttamente (€100/mese se reddito < 15.000)
- **Contributi agevolati Sud**: se sede lavoro in area C1/C2, verificare aliquota ridotta
```

### 2.3 Parser CCNL nell'app

L'app usa una libreria **YAML frontmatter parser** (es. `gray-matter` o equivalente JS) per estrarre:
1. **Frontmatter** → metadati e parametri globali (oggetto JSON flat)
2. **Tabelle Markdown** → minimi tabellari, assenze (convertite in array di oggetti)
3. **Sezioni h2/h3** → regole semantiche per il LLM (testo libero, non parsato rigidamente)

Il rule engine accede ai dati strutturati (frontmatter + tabelle). Il LLM accede al testo completo per il ragionamento narrativo.

### 2.4 Aggiornamenti

Quando il server rilascia una nuova versione del CCNL:
- Versione file: `COMMERCIO_2024_rev4.md`
- L'app scarica solo i file `.md` modificati (delta sync via hash/etag)
- Se un CCNL è obsoleto, l'app mostra banner: *"Profilo Revisore da aggiornare — connetti a internet per le novità"*

---

## 3. Prompt Engineering — LLM Locale

### 3.1 Modello target
- **Llama 3.2 3B** o **Qwen2.5 3B** quantizzato a 4-bit (~2GB)
- Gira su CPU mobile moderna (iPhone 12+, Android Snapdragon 7xx+)
- Framework: **llama.rn** (React Native bindings per llama.cpp) o **onnx-react-native**

### 3.2 Architettura prompt

Il LLM non elabora raw OCR. Riceve un **context strutturato** preparato dal rule engine.

#### System Prompt (fisso, embedded nell'app)

```
Sei un revisore contabile esperto in diritto del lavoro italiano. 
Il tuo compito è analizzare un cedolino di paga e spiegare i risultati in modo chiaro, professionale ma comprensibile.

REGOLE ASSOLUTE:
1. Non devi MAI fornire consulenza medica o sanitaria.
2. Non devi MAI suggerire azioni legali specifiche (es. "fai causa").
3. Devi sempre riferirti al CCNL indicato e alla normativa vigente.
4. Se un calcolo è corretto, confermalo brevemente.
5. Se trovi un'anomalia, spiega COSA è sbagliato, PERCHÉ è sbagliato secondo il CCNL, e COME dovrebbe essere calcolato.
6. Mantieni un tono neutro, oggettivo, da commercialista.
7. Se l'utente ha lavorato notti consecutive sopra il limite CCNL, puoi citare il CCNL ma NON fare riferimenti a rischi per la salute.
8. Non inventare dati. Se una informazione manca, dichiara "Dato non rilevato nel cedolino".
9. Struttura il testo in paragrafi con titoli chiari.
10. Concludi sempre con: "Questa analisi è generata automaticamente. Per verifiche definitive, consulta un commercialista o un sindacato."
```

#### User Prompt (dinamico, generato dal rule engine)

```markdown
## DATI CEDOLINO
- Mese: Aprile 2026
- CCNL: Terziario - Commercio, Livello 5 (Quadro)
- Lordo: €1.850,00
- Netto: €1.380,00
- Giorni lavorati: 22
- Ore ordinarie: 176
- Ore straordinarie: 10
- Ore notturne: 8
- Ore festive: 4
- Paga base: €1.450,00
- Scatti anzianità: €120,00
- TFR maturato: €45,50
- Ferie maturate: 2,50 gg
- Ferie usate: 0 gg
- ROL maturati: 0,83 gg
- ROL usati: 0 gg
- Maggiorazione notturna: €45,00
- Maggiorazione festiva: €32,00
- IRPEF: €320,00

## RISULTATI RULE ENGINE
- R001 (Lordo-Netto): PASS — calcolo corretto
- R101 (Paga Base): PASS — €1.450 >= minimo €1.450
- R103 (Maggiorazione Notturna): WARNING — atteso €52,00, rilevato €45,00 (delta -€7,00)
- R104 (Maggiorazione Festiva): PASS — €32,00 corretto
- R106 (Ferie): PASS — 2,50 gg maturati coerenti
- R108 (Ferie Residue): PASS — congruenza verificata
- R203 (Notti Consecutive): INFO — 4 notti nel mese, nessuna sequenza > 3

## DATI INVESTIGATIVI (da calendario/badge)
- Notti totali mese: 4
- Domeniche lavorate: 2
- Festività lavorate non maggiorate: ["2026-04-25"]
- Ore badge vs cedolino: 184 vs 186 (delta -2)

## CONTESTO CCNL (estratto)
Art. 42 — Lavoro Notturno: dalle 22:00 alle 06:00. Calcolo: ore_notturne * (paga_oraria_media * 1.25). Se > 3 notti consecutive, riposo compensativo.
Art. 43 — Lavoro Festivo: festività nazionali incluse 25 Aprile. Se lavorato: ore_festive * (paga_oraria_media * 1.30).

## ISTRUZIONE
Scrivi un report discorsivo come se fossi un commercialista che spiega i risultati della revisione al cliente. 
Non usare elenchi puntati tecnici. Usa paragrafi fluidi.
Evidenzia le anomalie con tono professionale ma chiaro.
Confronta i dati investigativi con il cedolino.
```

### 3.3 Output atteso (esempio)

```
Analisi del Cedolino — Aprile 2026

Ho esaminato il suo cedolino relativo al mese di aprile, relativo al CCNL del Terziario — Commercio, livello Quadro. Nel complesso, la struttura retributiva appare coerente: la paga base di €1.450,00 rispetta il minimo tabellare previsto per il suo livello, e il calcolo del netto è matematicamente corretto.

Tuttavia, ho riscontrato un'anomalia nella maggiorazione notturna. Il cedolino riporta €45,00 per 8 ore notturne, mentre secondo l'articolo 42 del suo CCNL, la maggiorazione del 25% sulla paga oraria media avrebbe dovuto produrre un importo di circa €52,00. La differenza è di €7,00. Le suggerisco di verificare con l'ufficio paghe se le 8 ore sono state classificate correttamente come notturne o se è stata applicata un'aliquota inferiore.

Per quanto riguarda le festività, ho notato dal suo calendario turni che ha lavorato il 25 aprile, giornata festiva nazionale. Il cedolino riporta una maggiorazione festiva di €32,00 per 4 ore festive totali, ma non è chiaro se il 25 aprile sia incluso in quel calcolo. Se ha lavorato quella giornata senza la relativa maggiorazione del 30%, l'importo mancante andrebbe recuperato.

Infine, un dato investigativo: le ore registrate dal suo badge nel mese sono 184, mentre il cedolino ne riporta 186. La differenza di 2 ore potrebbe essere dovuta a straordinari non timbrati o a un arrotondamento, ma merita un controllo incrociato.

Nel mese di aprile ha svolto 4 turni notturni, senza mai superare le 3 notti consecutive previste come limite dal CCNL. Non si segnalano quindi situazioni di riposo compensativo mancante.

Questa analisi è generata automaticamente. Per verifiche definitive, consulta un commercialista o un sindacato.
```

### 3.4 Ottimizzazioni

- **Max tokens**: 800 (report breve, leggibile su mobile)
- **Temperature**: 0.3 (creatività contenuta, factual)
- **Context window**: 4K (sufficiente per cedolino + CCNL estratto)
- **Caching**: se lo stesso cedolino viene ri-analizzato, il rule engine usa hash per evitare di rigenerare il report

---

## 4. Architettura Backend Self-Hosted

### 4.1 Stack zero-cost

| Componente | Tecnologia | Dove |
|------------|-----------|------|
| Server API | Express.js + TypeScript | VPS / Oracle Cloud Free Tier |
| Database | PostgreSQL 16 | Stesso server |
| Cache / Session | Redis (opzionale, può essere in-memory) | Stesso server |
| Auth | JWT + bcrypt | Server |
| Storage file | Filesystem (CCNL `.md` serviti staticamente) | Server |
| Reverse proxy | Nginx | Server |
| SSL | Let's Encrypt (certbot) | Server |

### 4.2 Schema Database

```sql
-- Utenti (solo metadati, zero dati sensibili)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    auth_provider VARCHAR(20) CHECK (auth_provider IN ('email', 'google', 'apple')),
    provider_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    last_login TIMESTAMP
);

-- Licenze Pro
CREATE TABLE licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tier VARCHAR(10) CHECK (tier IN ('free', 'pro', 'trial')),
    status VARCHAR(10) CHECK (status IN ('active', 'expired', 'revoked')),
    trial_started_at TIMESTAMP,
    trial_ends_at TIMESTAMP,
    purchased_at TIMESTAMP,
    transaction_id_apple VARCHAR(255),
    transaction_id_google VARCHAR(255),
    UNIQUE (user_id, tier)
);

-- Backup metadati Pro (checkpoint + elenco file)
CREATE TABLE backup_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    device_fingerprint VARCHAR(64) NOT NULL, -- hash anonimizzato
    checkpoint_json JSONB NOT NULL, -- es: {"mese":"2026-04","errori":3,"ccnl":"COMMERCIO"}
    file_list TEXT[] NOT NULL, -- nomi file caricati, NON i contenuti
    created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge releases (versionamento CCNL)
CREATE TABLE knowledge_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ccnl_id VARCHAR(50) NOT NULL,
    version VARCHAR(10) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_hash VARCHAR(64) NOT NULL, -- SHA-256
    released_at TIMESTAMP DEFAULT NOW(),
    valid_from DATE NOT NULL,
    valid_to DATE,
    UNIQUE (ccnl_id, version)
);

-- Audit log (solo operazioni server, zero dati cedolino)
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(50) NOT NULL,
    ip_hash VARCHAR(64), -- hash dell'IP per privacy
    user_agent_hash VARCHAR(64),
    created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 API Endpoints

#### Auth

| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| POST | `/auth/magic-link` | Invia magic link all'email | — |
| POST | `/auth/magic-link/verify` | Verifica token magic link, rilascia JWT | — |
| POST | `/auth/social` | Login/Registrazione via Google/Apple (idToken) | — |
| POST | `/auth/refresh` | Rinnova JWT | JWT |
| DELETE | `/auth/account` | Cancellazione account GDPR | JWT |

#### Licenze

| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| GET | `/license/status` | Restituisce tier attuale (free/trial/pro) + scadenza | JWT |
| POST | `/license/validate` | Valida receipt Apple/Google, attiva Pro | JWT |
| POST | `/license/restore` | Ripristina acquisti cross-device | JWT |

#### Knowledge

| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| GET | `/knowledge/manifest` | JSON con tutti i CCNL disponibili + hash + versione | JWT opzionale (anche free) |
| GET | `/knowledge/download/:ccnl_id/:version` | Scarica file `.md` del CCNL | JWT |
| GET | `/knowledge/diff` | Elenco file modificati dall'ultimo sync (usa `If-None-Match`) | JWT |

#### Backup (solo Pro)

| Metodo | Endpoint | Descrizione | Auth |
|--------|----------|-------------|------|
| POST | `/backup/checkpoint` | Salva metadati checkpoint | JWT + Pro |
| GET | `/backup/checkpoint` | Recupera lista checkpoint | JWT + Pro |
| DELETE | `/backup/checkpoint/:id` | Elimina checkpoint | JWT + Pro |

### 4.4 Flusso Licenza Pro (IAP)

```
Utente acquista Pro nell'app
    ↓
Apple/Google processano pagamento → restituiscono receipt
    ↓
App invia receipt al backend POST /license/validate
    ↓
Backend verifica receipt con Apple/Google server (lato server, non lato client)
    ↓
Se valido: aggiorna tabella licenses → status ACTIVE, tier PRO
    ↓
Backend risponde con JWT firmato che include claim "tier: pro"
    ↓
App salva JWT localmente e sblocca funzionalità Pro
    ↓
All'avvio successivo: app chiama GET /license/status per verificare
```

### 4.5 Sicurezza

- **JWT**: secret rotante, expiry 7 giorni, refresh token 30 giorni
- **Rate limiting**: 100 req/min per IP (nginx limit_req)
- **Receipt verification**: sempre lato server, mai lato client (anti-frode)
- **CORS**: strict, solo origini app mobili certificate
- **Helmet.js**: header di sicurezza HTTP
- **Input validation**: Zod su tutti i payload
- **Backup metadati**: nessun dato sensibile, solo nomi file e contatori

### 4.6 Deploy zero-cost

**Opzione A — Oracle Cloud Free Tier (consigliata)**
- 2 VM ARM64 sempre free (1 OCPU, 1GB RAM ciascuna)
- Una VM: API + PostgreSQL
- Una VM: Nginx + file statici CCNL
- Limitazione: 10TB traffico/mese (più che sufficiente per knowledge)

**Opzione B — VPS economico**
- Hetzner CX11 (€3,79/mese) o Contabo (€4/mese)
- Unica VM con Docker Compose: API + PostgreSQL + Nginx

---

## 5. Flusso Dati End-to-End (Diagramma)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DISPOSITIVO MOBILE                            │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────────────┐ │
│  │  Camera /   │  │  Badge       │  │  Calendario │  │  Storage        │ │
│  │  File       │  │  Check-in/out│  │  Turni       │  │  Cifrato        │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘  └─────────────────┘ │
│         │                │                  │                             │
│         └────────────────┼──────────────────┘                             │
│                          ↓                                              │
│                   ┌──────────────┐                                       │
│                   │  OCR On-Device│  ← Tesseract.js / ML Kit              │
│                   │  (Tesseract)  │                                       │
│                   └──────┬───────┘                                       │
│                          ↓                                              │
│                   ┌──────────────┐                                       │
│                   │  Rule Engine │  ← DAG deterministico                 │
│                   │  (JS/TS)     │                                       │
│                   └──────┬───────┘                                       │
│                          ↓                                              │
│                   ┌──────────────┐                                       │
│                   │  LLM Locale  │  ← Llama 3.2 3B (solo Pro)           │
│                   │  (llama.rn)  │                                       │
│                   └──────┬───────┘                                       │
│                          ↓                                              │
│                   ┌──────────────┐                                       │
│                   │  Report UI   │  ← Semafori / Tabelle / Narrativa    │
│                   │  (React Native)│                                       │
│                   └──────────────┘                                       │
│                                                                         │
│  Internet SOLO per:                                                     │
│  • Login / Auth  ─────────────→  Backend Self-Hosted                      │
│  • Licenza Pro  ─────────────→  Backend Self-Hosted                      │
│  • Download CCNL .md  ──────→  Backend Self-Hosted                      │
│  • Backup metadati  ─────────→  Backend Self-Hosted                     │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Checklist per Review Settoriale

Prima di procedere allo sviluppo, ogni sezione va rivista e approvata:

- [ ] **§1 Rule Engine**: Tutte le regole R001-R206 sono corrette? Manca qualche controllo?
- [ ] **§1 Rule Engine**: Le formule TFR, IRPEF scaglioni, contributi sono aggiornate al 2026?
- [ ] **§2 CCNL .md**: Il formato frontmatter + tabelle è sufficiente per tutti i CCNL?
- [ ] **§2 CCNL .md**: Serve un campo "regione" per CCNL con deroghe regionali?
- [ ] **§3 LLM Prompt**: Il system prompt è troppo rigido? Troppo permissivo?
- [ ] **§3 LLM Prompt**: La lunghezza output (800 token) è adeguata per mobile?
- [ ] **§4 Backend**: Lo schema DB copre tutti i casi (trial, restore, cancellazione)?
- [ ] **§4 Backend**: Il flusso receipt verification è antifrode?
- [ ] **§4 Backend**: Serve una tabella `devices` per limitare "one user one device"?
- [ ] **Generale**: Manca qualche funzionalità che abbiamo discusso nelle 30 domande?

---

**Prossimo passo:** Scegli la sezione da approfondire per prima, oppure conferma l'intero documento per procedere con la struttura del progetto React Native.
