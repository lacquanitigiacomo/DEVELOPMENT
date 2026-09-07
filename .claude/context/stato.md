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

**Prossimo passo.**
Farsi raccontare SmartSL a voce dall'utente e scriverlo nel glossario. Da lì,
capire se è un progetto nuovo, un modulo di RYB o un servizio esterno.
