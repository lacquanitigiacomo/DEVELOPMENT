# Architettura di lavoro — struttura target

> Decisa il 2026-09-07. Descrive dove vanno le cose e perche'.
> Se una sessione futura trova la realta' diversa da qui, questo file dice dov'e' la meta.

## Il problema che risolve

Piu' ambienti in parallelo — Claude Code in VS Code sul Mac, sessioni Claude Code web
(anche da telefono), Codex, Copilot — che **non condividono ne' memoria ne' skill**.
Le sessioni web girano su container effimeri in cloud: non hanno accesso al filesystem
del Mac, e vengono distrutte a fine sessione.

**L'unica superficie comune e' GitHub.** Tutto quello che deve essere condiviso passa
di li'. Quello che sta solo sul Mac, sta solo sul Mac.

## Ruoli dei repo

### DEVELOPMENT — hub
Backup completo delle skill di Skills Manager, memoria condivisa, configurazione
d'ambiente. **Nessun codice di progetto.**

Questa e' la condizione che rende il repo sicuro: i tool di backup fanno `push --force`
per rispecchiare lo stato locale, quindi il repo dev'essere di proprieta' esclusiva
dell'app. Finche' non contiene altro, un force-push non distrugge nulla.

I progetti che oggi sono qui dentro (`RYB_v20_Zero_Stress/`, `X-PAY CHECK/`,
`x-pay-check-vscode-kit/`) devono uscire prima che il backup inizi a scriverci.

### Un repo per progetto
`OSTERIE` (esiste), `X-PAY-CHECK` (da estrarre), `SMARTSL` (da creare), piu' i prossimi.

Ognuno con la stessa forma:

```
CLAUDE.md                   memoria del progetto, caricata in automatico
AGENTS.md                   puntatore per Codex
.github/copilot-instructions.md   puntatore per Copilot
.claude/
  context/
    stato.md                a che punto siamo
    decisioni.md            cosa e' stato deciso e perche'
  skills/                   il preset di skill di QUESTO progetto
.gitignore                  presente PRIMA del primo commit
```

Repo piccoli e separati non sono pignoleria: le sessioni cloud clonano il repo a ogni
avvio, e un repo pulito significa partire in secondi invece che in minuti.

## Il flusso delle skill

```
Skills Manager (Mac, 182 skill)     ← unica sorgente, l'utente cura qui
   │
   ├── backup completo    → DEVELOPMENT
   └── preset per progetto → <PROGETTO>/.claude/skills/
                                   │
                         ┌─────────┴─────────┐
                    VS Code (Mac)      sessioni web / telefono
                    legge anche         leggono solo il repo
                    il disco locale
```

`.claude/skills/` viene caricata in automatico all'apertura del repo. Aprendo il
progetto dal telefono, le skill di quel progetto sono gia' attive: nessun caricamento
manuale.

## Memoria condivisa fra assistenti diversi

Ogni assistente legge un file d'ingresso diverso. Tre puntatori sottili allo stesso
contenuto e leggono tutti la stessa memoria:

| Assistente | File |
|---|---|
| Claude | `CLAUDE.md` |
| Codex | `AGENTS.md` |
| Copilot | `.github/copilot-instructions.md` |

Il contenuto vero sta una volta sola in `.claude/context/`. I tre file puntano li'.

## Il "ponte" Mac ↔ telefono

Le sessioni cloud **non** possono raggiungere il Mac: non e' una configurazione mancante,
e' che il canale non esiste. L'effetto ponte si ottiene con il **push automatico**:
a Mac acceso, un watcher pusha le modifiche ogni pochi minuti, e le sessioni da telefono
leggono sempre uno stato fresco.

Regola minima, senza automazione: **pull prima di iniziare, push prima di chiudere**,
su entrambi i lati. Senza questo i due mondi divergono e si passa la sera dopo a
risolvere conflitti.

## Ordine di esecuzione

1. Sistemare il token GitHub di Skills Manager e far girare il backup *(utente, sul Mac)*
2. DEVELOPMENT e OSTERIE → privati *(utente)*
3. Estrarre `X-PAY-CHECK` in un repo proprio, con storia nuova e `.gitignore` a posto
4. Creare `SMARTSL` — bloccato: nessuno sa ancora cosa sia (vedi glossario)
5. Svuotare DEVELOPMENT dei progetti, lasciandolo come hub
6. Aggiungere `AGENTS.md` e `copilot-instructions.md` in ogni repo
7. Push automatico dal Mac, se si vuole il ponte continuo
