# Log delle decisioni

> Solo decisioni strutturali: quelle che un domani qualcuno potrebbe voler mettere
> in discussione, e che meritano di sapere *perché* erano state prese.
> Il più recente in alto.

---

## 2026-09-07 — Un repo per progetto, storia nuova, e X-PAY CHECK al posto di RYB

**Contesto.** `DEVELOPMENT` era ingestibile: 28.189 file tracciati, di cui 27.984
`node_modules` (tre copie: backend, backend-legacy, mobile) e 12 `.DS_Store`.
Il codice vero erano **197 file**. Nessun `.gitignore` in root: quella l'origine di tutto.
Cartella `.git` a 42 MB, con binari compilati per macOS dentro la storia.

**Deciso.**

1. **X-PAY CHECK ha sostituito RYB.** Stesso prodotto, stadio successivo. RYB non
   riceve piu' sviluppo e non avra' un repo proprio: resta nello storico.
2. **Un repo per progetto**: `OSTERIE` (esistente), `X-PAY-CHECK`, `SMARTSL`.
   Ogni repo con il suo `CLAUDE.md`, `.claude/context/` e `.claude/skills/`.
3. **I nuovi repo partono con storia nuova**, non ereditata. Ripulire 42 MB di
   `node_modules` dalla storia richiede riscritture dolorose; ripartire puliti e' gratis.
   `DEVELOPMENT` resta come archivio storico.
4. **Il backup di Skills Manager resta in `skills-manager-backup`**, repo dedicato di
   proprieta' esclusiva dell'app. Motivo: i tool di backup fanno `push --force` per
   rispecchiare lo stato locale; mettere altro nello stesso repo significa esporlo a
   cancellazione. Nessuno modifica quel repo a mano.

**Fatto subito.** `.gitignore` in root di entrambi i repo e `git rm -r --cached` su
`node_modules` e `.DS_Store`: da 28.189 file tracciati a 196. I file su disco sono
intatti, e' cambiato solo cosa git segue.

---

## 2026-09-07 — La memoria fra sessioni si tiene su git, non sui runtime

**Problema.** Tre ambienti Claude in uso (Claude Code su VS Code locale, app desktop
Anthropic, Claude Code web) più altri assistenti (ChatGPT, Copilot). Nessuno di questi
condivide memoria con gli altri. Le sessioni web girano su container effimeri, distrutti
a fine sessione. Risultato: ogni sessione ripartiva da zero e l'utente doveva ricaricare
il contesto a mano ogni volta.

**Scartato.**
- *Affidarsi alla memoria nativa dell'assistente*: esiste solo per le preferenze
  personali, non per lo stato dei progetti, e comunque non attraversa i runtime.
- *Sincronizzare via skill manager*: le skill sono capacità, non ricordi. Sincronizzarle
  non trasporta nulla di ciò che si è detto o deciso.

**Deciso.** Il contesto vive in **file versionati nel repo**:
`CLAUDE.md` in root (caricato in automatico da tutti i runtime Claude) che punta a
`.claude/context/` per lo stato esteso.

**Perché.** Il repo GitHub è l'unica superficie che tutti gli ambienti vedono davvero.
In più il contesto scritto è superiore a quello implicito: è leggibile, versionato,
diffabile, correggibile a mano, e resta utilizzabile anche da ChatGPT o Copilot quando
aprono il repo. Il costo è una disciplina di chiusura sessione (aggiorna + committa),
codificata nel protocollo in fondo a `CLAUDE.md`.
