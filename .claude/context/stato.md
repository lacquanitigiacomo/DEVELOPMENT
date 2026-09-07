# Stato dei lavori

> Il più recente in alto. Aggiornare a fine di ogni sessione, poi committare.
> Formato: data — cosa fatto / cosa aperto / prossimo passo.

---

## 2026-09-07 — Impianto del sistema di memoria

**Contesto.** Sessione partita per parlare di "SmartSL" (link Instagram fornito
dall'utente). Emerso subito un problema più grande: nessuna continuità fra sessioni.
L'utente lavora in combo con Claude Code su VS Code (Mac), l'app desktop Claude e
le sessioni web, credendo che condividano la memoria. Non la condividono.

**Fatto.**
- Diagnosticato: skill dell'account tutte sincronizzate (22, incluse le custom
  `analisi-lavoro`, `carmy`, `digital-dev`, `pantheon`, `stark`), connettori attivi,
  preferenze utente presenti. Mancava **qualsiasi** file di contesto: nessun
  `CLAUDE.md` in nessuno dei due repo, nessuna traccia di sessioni precedenti.
- Creato questo impianto: `CLAUDE.md` in root (auto-caricato ogni sessione) +
  `.claude/context/` con stato, decisioni, glossario. Stesso schema su OSTERIE.

**Aperto.**
- **SmartSL resta ignoto.** L'utente ha condiviso un reel Instagram
  (`instagram.com/reel/Dc8fYtFtLpR`) ma il dominio è bloccato dalla network policy
  dell'ambiente remoto: non apribile. Contenuto mai acquisito.
- Rapporto RYB v20 ↔ X-PAY CHECK non chiarito.

**Emerso a fine sessione.**
- L'utente usa **Skills Manager** (app macOS): 182 skill in libreria, 71 abilitate per
  Claude Code. Nelle sessioni cloud ne arrivano 21, perche Skills Manager scrive su
  `~/.claude/skills` del Mac mentre le sessioni cloud leggono il bucket sincronizzato
  dall'account Anthropic. Due canali distinti: il container non vede il disco locale.
  Per armare le sessioni web le skill vanno committate in `.claude/skills/` nel repo
  oppure caricate sull'account.
- **Carmy** deve diventare un agente AI proattivo (vedi glossario).

**Deciso a fine sessione.** X-PAY CHECK sostituisce RYB; un repo per progetto con
storia nuova; backup skill in repo dedicato. Dettagli e motivazioni in `decisioni.md`.

**Ripulito.** `.gitignore` in root (non esisteva) e `node_modules`/`.DS_Store` tolti
dal tracking: da 28.189 file tracciati a 196.

**In carico all'utente, sul Mac (io da qui non posso):**
1. Sistemare il token GitHub di Skills Manager (il backup fallisce da subito: repo creato
   il 04/09 alle 23:48:29, push fallito alle 23:48:30, zero commit). Causa probabile:
   token fine-grained limitato a repo selezionati, che non include quello appena creato,
   oppure token classico con solo `public_repo` su un repo privato.
2. Mettere **DEVELOPMENT e OSTERIE privati**: sono pubblici, unici fra i 13 repo.

**Prossimo passo.**
Farsi raccontare SmartSL a voce dall'utente e scriverlo nel glossario. Da lì,
capire se è un progetto nuovo, un modulo di RYB o un servizio esterno.
