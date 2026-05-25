# X-PAY CHECK — Front-End Product Specification

**Versione:** 1.0  
**Tipo documento:** Specifica front-end per VS Code / sviluppo React Native o web app  
**Nome prodotto:** X-PAY CHECK  
**Claim:** La tua busta paga, finalmente leggibile.  
**Obiettivo:** creare un'app di analisi finanziaria dei cedolini paga, con onboarding lavorativo, selezione CCNL, gestione turni, calendario, report anomalie e focus personalizzati.

---

## 1. Visione prodotto

X-PAY CHECK è un'app che aiuta il lavoratore a capire se la propria busta paga è coerente con contratto, orari, turni, straordinari, ferie, ROL, TFR, contributi e maggiorazioni.

Il prodotto deve comunicare tre concetti:

1. **Controllo** — l'utente capisce cosa c'è nel cedolino.
2. **Privacy** — i dati sensibili restano sul dispositivo.
3. **Chiarezza** — il report deve essere leggibile anche da chi non conosce diritto del lavoro o paghe.

---

## 2. Principi UX

- Evitare linguaggio legale aggressivo.
- Non scrivere frasi come “il tuo datore ti deve soldi”.
- Preferire formule come “potrebbe esserci una differenza da verificare”.
- Rendere sempre modificabili i dati estratti dall'OCR.
- Far capire all'utente che il login non serve per caricare cedolini online, ma per licenza, aggiornamenti CCNL e sincronizzazione metadati.
- Usare semafori chiari: `CRITICO`, `AVVISO`, `INFO`, `OK`.
- Ogni report deve distinguere tra dati certi, dati stimati e dati mancanti.

---

## 3. Architettura front-end

```txt
/public
  landing
  pricing
  faq
  privacy
  login

/auth
  login
  register
  magic-link
  social-auth

/onboarding
  welcome
  privacy
  ccnl
  job-profile
  work-hours
  shift-pattern
  focus
  confirmation

/app
  home
  paychecks
  paycheck-upload
  paycheck-review
  audit-report
  shifts-calendar
  shift-patterns
  analysis
  month-comparison
  simulator
  settings
```

---

## 4. Navigazione principale

### Bottom navigation mobile

```txt
Home
Cedolini
Turni
Controlli
Profilo
```

### Routing logico

```txt
Landing → Auth → Onboarding → Dashboard
Dashboard → Carica cedolino → Revisione dati → Report
Dashboard → Calendario turni → Pattern → Confronto cedolino
Dashboard → Controlli → Focus → Simulatore → Storico anomalie
Profilo → CCNL → Licenza → Privacy → Knowledge updates
```

---

## 5. Landing page

### Hero

**Titolo:**  
La tua busta paga, finalmente leggibile.

**Sottotitolo:**  
X-PAY CHECK analizza cedolini, turni, ferie, ROL, TFR, straordinari e maggiorazioni secondo il tuo CCNL.

**CTA:**

- Inizia gratis
- Scopri come funziona

**Micro-copy privacy:**  
I tuoi cedolini restano sul tuo dispositivo. X-PAY CHECK lavora offline dopo il primo setup.

### Sezione “Cosa controlla”

Cards:

1. Netto e lordo
2. CCNL e livello
3. Turni e calendario
4. Straordinari
5. Ferie, ROL e TFR
6. Anomalie ricorrenti

### Sezione “Come funziona”

```txt
1. Carichi il cedolino
2. Confermi il CCNL
3. Aggiungi turni o orari
4. Ricevi un report chiaro
```

### Sezione privacy

**Titolo:**  
I tuoi dati restano tuoi.

**Copy:**  
X-PAY CHECK analizza i dati sensibili sul dispositivo. Il server serve solo per accesso, licenza, aggiornamenti CCNL e metadati non sensibili.

### Sezione pricing

#### Free

- Analisi base cedolino
- Selezione CCNL
- Report sintetico
- Storico limitato
- Aggiornamento CCNL manuale

#### Pro

- Analisi avanzata
- Calendario turni
- Confronto badge/cedolino
- Report discorsivo
- Storico multi-mese
- Simulatore
- Backup metadati
- Notifiche anomalie

#### Trial

- Tutte le funzioni Pro
- Durata configurabile
- Nessun upload dei cedolini sul server

---

## 6. Autenticazione

### Metodi supportati

```txt
Continua con Google
Continua con Apple
Accedi con email
```

### Login email consigliato

Usare magic link, non password.

### Copy schermata auth

**Titolo:**  
Accedi a X-PAY CHECK

**Sottotitolo:**  
Ti serve solo per licenza, aggiornamenti CCNL e sincronizzazione sicura.

**Nota:**  
I tuoi cedolini non vengono caricati online.

### Stati auth

```ts
export type AuthProvider = 'email' | 'google' | 'apple';

export interface AuthSession {
  userId: string;
  email: string;
  provider: AuthProvider;
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
}
```

---

## 7. Onboarding

L'onboarding deve sembrare un setup guidato, non un questionario.

### Step 1 — Welcome

**Titolo:**  
Impostiamo il tuo profilo di controllo.

**Copy:**  
Bastano pochi dati per confrontare i tuoi cedolini con il contratto corretto.

**CTA:**  
Inizia configurazione

---

### Step 2 — Privacy

**Titolo:**  
I tuoi dati restano sul tuo dispositivo.

Indicatori:

```txt
Cedolini salvati localmente       Attivo
Analisi eseguita localmente       Attivo
Backup contenuto cedolini         Disattivato
Backup metadati Pro               Opzionale
```

---

### Step 3 — CCNL

**Domanda:**  
Che contratto hai?

UI:

- search bar;
- categorie;
- lista CCNL;
- opzione “Non lo so”;
- opzione “Rilevalo dal cedolino”.

Esempio lista iniziale:

```txt
Commercio
Metalmeccanico Industria
Turismo
Multiservizi
Cooperative sociali
Sanità privata
Studi professionali
Altro / Non lo so
```

**Nota tecnica:**  
Non hardcodare la lista. Il front-end deve leggerla dal manifest knowledge.

---

### Step 4 — Profilo lavorativo

Campi:

```txt
Livello
Qualifica
Paga base opzionale
Data assunzione opzionale
Sede lavoro opzionale
Ore settimanali contrattuali
```

Copy:

> Puoi saltare i dati che non conosci: X-PAY CHECK proverà a leggerli dal cedolino.

---

### Step 5 — Orari di lavoro

**Domanda:**  
Come vuoi indicare i tuoi orari?

Opzioni:

```txt
Orario fisso settimanale
Turni variabili
Calendario manuale
Importa da calendario
Lo farò più tardi
```

#### Orario fisso

```txt
Ore settimanali
Giorni lavorativi
Ora inizio
Ora fine
Pausa inclusa sì/no
```

#### Turni variabili

```txt
Turno mattina: 06:00 - 14:00
Turno pomeriggio: 14:00 - 22:00
Turno notte: 22:00 - 06:00
Riposo
```

---

### Step 6 — Pattern turni

**Domanda:**  
Hai un pattern ricorrente?

Opzioni:

```txt
Sempre uguale
Ciclo 2 mattine / 2 pomeriggi / 2 notti / 2 riposi
Settimane alternate
Nessun pattern
Lo imposto dal calendario
```

Pattern builder:

```txt
Nome pattern
Data inizio
Sequenza turni
Durata ciclo
Ripeti fino a
```

Esempio:

```txt
M M P P N N R R
```

Legenda:

```txt
M = mattina
P = pomeriggio
N = notte
R = riposo
```

---

### Step 7 — Focus controlli

**Domanda:**  
Cosa vuoi controllare meglio?

Checkbox:

```txt
Straordinari
Notti
Festivi e domeniche
Ferie e ROL
TFR
Malattia
Netto troppo basso
Contributi e IRPEF
Differenze tra mesi
Tutto
```

Queste preferenze influenzano:

- dashboard;
- ordine anomalie;
- report;
- notifiche;
- suggerimenti.

---

### Step 8 — Conferma

**Titolo:**  
Profilo di controllo pronto.

Riepilogo:

```txt
CCNL: Commercio
Livello: 5
Orario: turni variabili
Focus: notti, straordinari, festivi
Privacy: dati locali
```

CTA:

```txt
Entra in X-PAY CHECK
```

---

## 8. Dashboard

### Stato vuoto

**Titolo:**  
Primo controllo

**Copy:**  
Carica il tuo primo cedolino per iniziare.

CTA:

```txt
Scansiona cedolino
Carica PDF
```

### Stato con dati

Header:

```txt
Ciao, Giacomo
Profilo: CCNL Commercio · Livello 5
Knowledge: aggiornato
```

Card principale:

```txt
Ultima analisi
Aprile 2026
2 criticità
5 avvisi
14 controlli ok
```

Azioni rapide:

```txt
Carica cedolino
Aggiungi turno
Apri calendario
Confronta mesi
```

---

## 9. Caricamento cedolino

### Opzioni

```txt
Scatta foto
Carica PDF
Importa immagine
Inserisci dati manualmente
```

### Progress step

```txt
1. Lettura documento
2. Estrazione dati
3. Riconoscimento CCNL
4. Controllo regole
5. Generazione report
```

### Revisione dati estratti

Mostrare sempre una schermata di conferma.

Campi principali:

```txt
Mese
CCNL rilevato
Livello
Lordo
Netto
Ore ordinarie
Straordinari
Ore notturne
Ore festive
Ferie maturate
ROL maturati
TFR maturato
IRPEF
Contributi
```

CTA:

```txt
Conferma e analizza
Correggi dati
```

---

## 10. Report analisi

### Header

```txt
Analisi cedolino — Aprile 2026
CCNL Commercio · Livello 5
```

### Score

```txt
Stato: Da verificare
Criticità: 2
Avvisi: 5
Controlli superati: 14
```

### Sezioni report

1. Sintesi
2. Anomalie critiche
3. Avvisi
4. Controlli corretti
5. Dati investigativi
6. Suggerimenti di verifica
7. Disclaimer

### Card anomalia

```txt
Titolo: Maggiorazione notturna inferiore
Priorità: Avviso
Ore rilevate: 8
Importo rilevato: €45,00
Importo atteso: €52,00
Differenza: -€7,00
Riferimento: Art. 42 — Lavoro notturno
CTA: Segna come verificato
```

### Disclaimer obbligatorio

> Questa analisi è generata automaticamente. Per verifiche definitive, consulta un commercialista o un sindacato.

---

## 11. Calendario turni

### Viste

```txt
Mese
Settimana
Lista
Pattern
```

### Tipi giorno

```txt
Mattina
Pomeriggio
Notte
Riposo
Ferie
Malattia
Permesso
Festivo lavorato
Straordinario
```

### Card giorno

```txt
Martedì 25 Aprile
Turno: 14:00 - 22:00
Tipo: Festivo lavorato
Nota: da confrontare con cedolino
```

### Azioni

```txt
Aggiungi turno
Applica pattern
Importa calendario
Modifica giorno
Duplica turno
```

---

## 12. Pattern turni

### Form

```txt
Nome pattern
Sequenza turni
Data inizio
Ripeti fino a
Giorni esclusi
Festivi inclusi sì/no
```

### Esempio UI

```txt
Ciclo 4+2
[M] [M] [P] [P] [R] [R]
```

### Funzioni

- salvare più pattern;
- applicare un pattern a un intervallo;
- modificare un singolo giorno senza rompere la sequenza;
- segnalare notti consecutive;
- segnalare domeniche/festivi lavorati.

---

## 13. Focus controlli

Pagina: **I miei controlli**

```txt
Straordinari             Alta
Notti                    Alta
Ferie e ROL              Media
TFR                      Media
IRPEF e contributi       Bassa
Festivi                  Alta
Malattia                 Media
```

Priorità disponibili:

```txt
Alta
Media
Bassa
Disattivata
```

---

## 14. Archivio cedolini

### Lista

```txt
Maggio 2026    Da verificare    1 criticità
Aprile 2026    Critico          2 criticità
Marzo 2026     OK               0 criticità
```

### Filtri

```txt
Anno
CCNL
Solo anomalie
Solo criticità
Solo straordinari
Solo ferie/ROL
Solo notturni
Solo festivi
```

### Dettaglio cedolino

```txt
PDF locale
Dati estratti
Report
Confronto mese precedente
Note utente
Stato verifica
```

---

## 15. Confronto mesi

### Metriche

```txt
Netto
Lordo
Ore ordinarie
Straordinari
Ore notturne
Ore festive
Ferie maturate
ROL maturati
TFR
IRPEF
Contributi
```

### Esempio sintesi

```txt
Aprile vs Marzo
Netto: -€120
Straordinari: +8 ore
IRPEF: +€75
Ferie residue: -2 giorni
```

### Copy automatico

> La diminuzione del netto sembra collegata a una trattenuta IRPEF superiore e a minori maggiorazioni rispetto al mese precedente.

---

## 16. Simulatore

### Input

```txt
Ore ordinarie
Straordinari
Ore notturne
Festivi
Ferie
Malattia
Permessi
Bonus
Premi
```

### Output

```txt
Lordo stimato
Netto stimato
Maggiorazioni attese
Ferie/ROL stimati
TFR stimato
Possibili avvisi
```

### Nota

> Stima indicativa, non sostituisce il cedolino ufficiale.

---

## 17. Notifiche

Tipi:

```txt
Profilo CCNL da aggiornare
Cedolino del mese non ancora controllato
Turni inseriti ma cedolino mancante
Anomalia ricorrente su straordinari
Possibile festività non maggiorata
Knowledge profile aggiornato
Trial Pro in scadenza
```

Tone of voice:

- neutro;
- chiaro;
- non allarmistico;
- orientato alla verifica.

Esempio buono:

> Potrebbe esserci una differenza da verificare sulle ore festive di aprile.

Esempio da evitare:

> Il datore ti ha pagato male.

---

## 18. Settings

### Profilo

```txt
Nome
Email
CCNL
Livello
Qualifica
Sede lavoro opzionale
Orario standard
```

### Licenza

```txt
Piano attuale
Trial
Pro
Ripristina acquisti
Gestisci abbonamento
```

### Privacy

```txt
Cancella dati locali
Esporta dati
Backup metadati
Dispositivo associato
Elimina account
```

### Knowledge

```txt
CCNL installati
Versione
Ultimo aggiornamento
Aggiorna ora
```

---

## 19. Componenti UI

```txt
AppShell
AuthLayout
LandingLayout
OnboardingLayout
DashboardCard
PaycheckUploadCard
AuditStatusBadge
SeverityBadge
CCNLSelector
WorkPatternBuilder
ShiftCalendar
ShiftDayCard
FocusSelector
ReportSummaryCard
AnomalyCard
RuleCheckAccordion
MonthComparisonChart
PrivacyStatusCard
KnowledgeUpdateBanner
LicensePaywall
```

---

## 20. Modelli dati TypeScript

```ts
export type Severity = 'PASS' | 'INFO' | 'WARNING' | 'CRITICAL';

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface WorkerProfile {
  ccnlId?: string;
  ccnlName?: string;
  level?: string;
  qualification?: string;
  baseSalary?: number;
  weeklyHours?: number;
  workLocation?: string;
  hireDate?: string;
}

export interface CCNLManifestItem {
  ccnlId: string;
  name: string;
  sector: string;
  version: string;
  fileHash: string;
  validFrom: string;
  validTo?: string;
  sizeKb?: number;
}

export interface Paycheck {
  id: string;
  month: string;
  localFileUri?: string;
  extractedData: ExtractedPaycheckData;
  auditResult?: AuditResult;
  createdAt: string;
  updatedAt: string;
}

export interface ExtractedPaycheckData {
  month: string;
  ccnlApplied?: string;
  level?: string;
  gross?: number;
  net?: number;
  ordinaryHours?: number;
  overtimeHours?: number;
  nightHours?: number;
  holidayHours?: number;
  baseSalary?: number;
  senioritySteps?: number;
  tfrAccrued?: number;
  vacationAccruedDays?: number;
  vacationUsedDays?: number;
  rolAccruedDays?: number;
  rolUsedDays?: number;
  irpef?: number;
  employeeInps?: number;
}

export interface AuditResult {
  id: string;
  paycheckId: string;
  timestamp: string;
  maxSeverity: Severity;
  summary: AuditSummary;
  checks: AuditCheck[];
  investigativeData?: InvestigativeData;
}

export interface AuditSummary {
  totalChecks: number;
  critical: number;
  warning: number;
  info: number;
  pass: number;
}

export interface AuditCheck {
  ruleId: string;
  name: string;
  status: Severity;
  expectedValue?: number | string;
  detectedValue?: number | string;
  delta?: number;
  message: string;
  ccnlReference?: string;
  suggestion?: string;
}

export type ShiftType =
  | 'morning'
  | 'afternoon'
  | 'night'
  | 'rest'
  | 'vacation'
  | 'sick_leave'
  | 'permit'
  | 'holiday_worked'
  | 'overtime';

export interface Shift {
  id: string;
  date: string;
  type: ShiftType;
  startTime?: string;
  endTime?: string;
  breakMinutes?: number;
  notes?: string;
}

export interface ShiftPattern {
  id: string;
  name: string;
  sequence: ShiftType[];
  startDate: string;
  repeatUntil?: string;
}

export interface FocusPreference {
  key:
    | 'overtime'
    | 'night'
    | 'holidays'
    | 'vacation_rol'
    | 'tfr'
    | 'sick_leave'
    | 'net_salary'
    | 'taxes_contributions'
    | 'month_differences';
  priority: 'high' | 'medium' | 'low' | 'off';
}
```

---

## 21. API front-end expected contracts

```txt
POST   /auth/magic-link
POST   /auth/magic-link/verify
POST   /auth/social
POST   /auth/refresh
DELETE /auth/account

GET    /license/status
POST   /license/validate
POST   /license/restore

GET    /knowledge/manifest
GET    /knowledge/download/:ccnl_id/:version
GET    /knowledge/diff

POST   /backup/checkpoint
GET    /backup/checkpoint
DELETE /backup/checkpoint/:id
```

---

## 22. MVP roadmap

### MVP 1

- Landing
- Login Google/email
- Onboarding
- Selezione CCNL
- Caricamento cedolino
- Revisione dati estratti
- Report base
- Archivio cedolini
- Privacy settings

### MVP 2

- Calendario turni
- Pattern turni
- Confronto cedolino/calendario
- Focus personalizzati
- Confronto mesi

### MVP 3

- Simulatore
- Report discorsivo Pro
- Backup metadati
- Notifiche intelligenti
- Import calendario
- Paywall completo

---

## 23. Direzione grafica

### Stile

Fintech scuro, sobrio, leggibile.

### Palette suggerita

```txt
Background: #07111F
Surface: #0F1B2D
Surface elevated: #14233A
Primary: #22D3EE
Primary dark: #0891B2
Success: #22C55E
Warning: #F59E0B
Critical: #EF4444
Text primary: #F8FAFC
Text secondary: #94A3B8
Border: #243449
```

### UI shape

```txt
Radius cards: 20px
Radius buttons: 14px
Shadow: soft, low opacity
Spacing base: 8px
Card padding: 16-24px
Mobile first
```

---

## 24. Reference image brief

Usare queste immagini come riferimento visivo:

1. **Landing + hero**  
   Desktop/mobile fintech dark, claim forte, privacy card, CTA chiara.

2. **Onboarding flow**  
   Schermate CCNL, orari, pattern turni, focus controlli.

3. **Dashboard + report audit**  
   Card riepilogo anomalie, severità, ultimo cedolino, azioni rapide.

4. **Calendario + pattern turni**  
   Vista mese, turni color-coded, generatore pattern, alert festivi/notturni.

5. **Design system**  
   Palette, bottoni, badge severità, cards, typography, componenti base.

---

## 25. Prompt per generare il progetto in VS Code / AI assistant

```txt
Crea un front-end mobile-first per X-PAY CHECK, app fintech per analisi buste paga italiane.

Stack preferito:
- React Native con Expo oppure React + Vite se web.
- TypeScript obbligatorio.
- Componenti modulari.
- Stato locale per profilo lavoratore, cedolini, turni, focus controlli.
- Tema dark fintech con palette: background #07111F, surface #0F1B2D, primary #22D3EE, success #22C55E, warning #F59E0B, critical #EF4444.

Schermate da creare:
1. Landing
2. Login con Google, Apple, email magic link
3. Onboarding privacy
4. Selezione CCNL
5. Profilo lavorativo
6. Orari di lavoro
7. Pattern turni
8. Focus controlli
9. Dashboard
10. Caricamento cedolino
11. Revisione dati estratti
12. Report audit
13. Calendario turni
14. Archivio cedolini
15. Confronto mesi
16. Simulatore
17. Settings privacy/licenza/knowledge

Requisiti UX:
- I dati sensibili devono apparire come salvati localmente.
- Il login serve solo per licenza e aggiornamenti CCNL.
- Ogni anomalia deve mostrare severità, spiegazione, valore atteso, valore rilevato e suggerimento.
- L'OCR deve avere una schermata di revisione dati prima dell'analisi.
- Il report deve usare linguaggio chiaro e non aggressivo.

Crea mock data realistici per:
- CCNL Commercio
- Cedolino Aprile 2026
- Turni con notti, domeniche e festivi
- Report con 2 criticità, 5 avvisi, 14 controlli ok

Genera una struttura file pulita e pronta per sviluppo.
```

---

## 26. File structure consigliata

```txt
src/
  app/
    navigation/
    routes/
  components/
    auth/
    dashboard/
    paychecks/
    reports/
    shifts/
    onboarding/
    settings/
    ui/
  features/
    auth/
    ccnl/
    knowledge/
    paychecks/
    rule-engine/
    shifts/
    focus/
    license/
  hooks/
  lib/
    api.ts
    storage.ts
    theme.ts
    formatters.ts
  mock/
    ccnl.ts
    paychecks.ts
    shifts.ts
    audit.ts
  types/
    index.ts
```

---

## 27. Regola prodotto importante

Non chiamare la prima raccolta dati “notizie dell'utente”.

Usare invece:

```txt
Profilo di controllo
```

oppure:

```txt
Impostazione lavorativa
```

La frase migliore per il focus è:

```txt
Cosa vuoi controllare meglio?
```

non:

```txt
Quali sono le cose su cui vuoi fare focus?
```
