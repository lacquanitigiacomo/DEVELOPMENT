# DEVELOPMENT — contesto permanente

> Questo file viene caricato **automaticamente** all'avvio di ogni sessione Claude
> (web, VS Code, CLI). È la memoria del repo: se una cosa non è scritta qui o in
> `.claude/context/`, alla sessione successiva non esiste.

## Chi lavora qui

Giacomo Lacquaniti — visual designer con basi solide di web development, animazione 3D
e presentazione progetti. Si lavora **in italiano**. Preferisce codice semantico,
leggibile e manutenibile, e soluzioni motivate: prima il perché, poi il come.

> ⚠️ **Questo repo sta cambiando ruolo.** Diventa l'**hub** delle skill e della memoria
> condivisa; i progetti escono verso repo propri. Struttura target e ordine di
> esecuzione in `.claude/context/architettura.md`. Sotto c'e' lo stato attuale.

## Progetti in questo repo (in uscita)

| Progetto | Cartella | Cos'è | Stato |
|---|---|---|---|
| **RYB v20 Zero Stress** | `RYB_v20_Zero_Stress/` | Piattaforma di analisi incrociata buste paga / orari / timbrature / CCNL | ⚠️ superato da X-PAY CHECK, resta come storico |
| **X-PAY CHECK** | `X-PAY CHECK/` | **Il progetto attivo della linea**: ha sostituito RYB | da estrarre in repo proprio |
| **SmartSL** | — | ❓ **NON DOCUMENTATO** — vedi `.claude/context/glossario.md` | ignoto |

Documenti di riferimento in root:
- `README.md` — filosofia e avvio rapido RYB v20
- `PROPOSTA_REFACTOR.md` — roadmap UX/UI e intelligence di RYB v20
- `RYB_Mobile_TechSpec_v1.md` — spec mobile
- `X-PAY-CHECK_frontend_spec.md` — spec frontend X-PAY

## Contesto esteso

- `.claude/context/architettura.md` — **dove vanno le cose e perche'**: struttura target
- `.claude/context/stato.md` — a che punto siamo, sessione per sessione
- `.claude/context/decisioni.md` — decisioni prese e perché
- `.claude/context/glossario.md` — cosa significano i nomi propri del progetto

Leggili quando servono. Non sono caricati in automatico: questo file sì.

## Skill da usare

Le skill dell'account sono sincronizzate in ogni sessione. Per questo repo le pertinenti sono:

- **`analisi-lavoro`** — RYB e X-PAY sono strumenti di analisi del contenzioso
  lavorativo: buste paga, ricostruzione orari, CCNL. Il dominio è quello.
- **`digital-dev`** — per ogni intervento su codice
- **`stark`** — problemi tecnici aperti, architettura, workaround
- **`pantheon`** — progetti multidisciplinari o strategici

## Convenzioni

- Branch di lavoro assegnato dalla sessione (`claude/...`), mai push diretto su `main`
- Commit descrittivi, in italiano o inglese ma coerenti nel messaggio
- Non introdurre dipendenze o servizi a pagamento: la filosofia dei progetti è zero-cash
- `.env` non si committa mai; `.env.example` sì

## ⚠️ Protocollo di memoria — LEGGERE

L'ambiente Claude Code web è **effimero**: il container viene distrutto a fine sessione.
Le conversazioni **non** sopravvivono. Solo i file committati sopravvivono.

**Quindi, a fine di ogni sessione di lavoro sostanziale:**

1. Aggiorna `.claude/context/stato.md` con: cosa si è fatto, cosa è rimasto aperto, cosa viene dopo
2. Se è stata presa una decisione strutturale, aggiungila a `.claude/context/decisioni.md`
3. Se è emerso un termine nuovo, aggiungilo a `.claude/context/glossario.md`
4. **Committa e pusha.** Un aggiornamento non committato è un aggiornamento perso.

Questo vale anche quando la sessione sembra interlocutoria: soprattutto allora.

## Domande aperte

- **Cos'è SmartSL?** Nominato dall'utente, assente dal repo. Da documentare.
- Instagram è bloccato dalla network policy delle sessioni web: link a reel non
  sono apribili da qui. Serve che i contenuti vengano incollati come testo.
