# Log delle decisioni

> Solo decisioni strutturali: quelle che un domani qualcuno potrebbe voler mettere
> in discussione, e che meritano di sapere *perché* erano state prese.
> Il più recente in alto.

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
