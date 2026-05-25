const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' }));

const checkpoints = [];

function toFixed2(n) {
  return Math.round(n * 100) / 100;
}

function runAudit(cedolino) {
  const d = cedolino.dati_numerici || {};
  const assenze = cedolino.assenze || {};

  const irpefTot = (d.irpef || 0) + (d.addizionale_regionale || 0) + (d.addizionale_comunale || 0);
  const nettoCalcolato = toFixed2((d.lordo || 0) - irpefTot - (d.contributi_inps_dipendente || 0) - (d.contributi_inail || 0));
  const nettoCedolino = d.netto || 0;
  const deltaNetto = toFixed2(nettoCedolino - nettoCalcolato);

  const oreOrd = d.ore_ordinarie || 0;
  const pagaBase = d.paga_base || 0;
  const pagaOraria = oreOrd > 0 ? pagaBase / oreOrd : 0;
  const expectedNotturna = toFixed2((d.ore_notturne || 0) * pagaOraria * 0.25);
  const expectedFestiva = toFixed2((d.ore_festive || 0) * pagaOraria * 0.3);

  const giorniMese = 30;
  const giorniContati = (d.giorni_lavorati || 0)
    + (assenze.malattia_gg || 0)
    + (assenze.ferie_gg || 0)
    + (assenze.rol_gg || 0)
    + (assenze.maternita_gg || 0)
    + (assenze.cassa_integrazione_gg || 0);

  const rules = [
    {
      regola_id: 'R001',
      nome: 'Coerenza Lordo-Netto',
      stato: Math.abs(deltaNetto) <= 0.01 ? 'PASS' : 'CRITICO',
      valore_atteso: nettoCalcolato,
      valore_rilevato: nettoCedolino,
      delta: deltaNetto,
      severita: Math.abs(deltaNetto) <= 0.01 ? 'PASS' : 'CRITICO',
      messaggio: Math.abs(deltaNetto) <= 0.01
        ? 'Il netto calcolato coincide con il netto riportato.'
        : 'Il netto riportato non coincide con il calcolo base.'
    },
    {
      regola_id: 'R103',
      nome: 'Maggiorazione Notturna',
      stato: (d.ore_notturne || 0) === 0 || (d.maggiorazione_notturna || 0) >= expectedNotturna ? 'PASS' : 'WARNING',
      valore_atteso: expectedNotturna,
      valore_rilevato: d.maggiorazione_notturna || 0,
      delta: toFixed2((d.maggiorazione_notturna || 0) - expectedNotturna),
      severita: (d.ore_notturne || 0) === 0 || (d.maggiorazione_notturna || 0) >= expectedNotturna ? 'PASS' : 'WARNING',
      messaggio: 'Controllo maggiorazione notturna.'
    },
    {
      regola_id: 'R104',
      nome: 'Maggiorazione Festiva',
      stato: (d.ore_festive || 0) === 0 || (d.maggiorazione_festiva || 0) >= expectedFestiva ? 'PASS' : 'WARNING',
      valore_atteso: expectedFestiva,
      valore_rilevato: d.maggiorazione_festiva || 0,
      delta: toFixed2((d.maggiorazione_festiva || 0) - expectedFestiva),
      severita: (d.ore_festive || 0) === 0 || (d.maggiorazione_festiva || 0) >= expectedFestiva ? 'PASS' : 'WARNING',
      messaggio: 'Controllo maggiorazione festiva.'
    },
    {
      regola_id: 'R005',
      nome: 'Congruenza Giorni',
      stato: giorniContati === giorniMese ? 'PASS' : 'CRITICO',
      valore_atteso: giorniMese,
      valore_rilevato: giorniContati,
      delta: giorniContati - giorniMese,
      severita: giorniContati === giorniMese ? 'PASS' : 'CRITICO',
      messaggio: giorniContati === giorniMese ? 'Totale giorni coerente.' : 'Somma giorni non coerente.'
    }
  ];

  const critici = rules.filter((r) => r.severita === 'CRITICO').length;
  const warning = rules.filter((r) => r.severita === 'WARNING').length;
  const info = rules.filter((r) => r.severita === 'INFO').length;
  const pass = rules.filter((r) => r.severita === 'PASS').length;
  const severita_massima = critici > 0 ? 'CRITICO' : warning > 0 ? 'WARNING' : info > 0 ? 'INFO' : 'PASS';

  return {
    audit_id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    ccnl: (cedolino.dati_testuali && cedolino.dati_testuali.ccnl_applicato) || 'NON_RILEVATO',
    livello: (cedolino.dati_testuali && cedolino.dati_testuali.livello) || 'N/A',
    severita_massima,
    riepilogo: {
      totale_controlli: rules.length,
      critici,
      warning,
      info,
      pass
    },
    dettaglio: rules,
    dati_investigativi: {
      notti_totali_mese: Math.max(0, Math.round((d.ore_notturne || 0) / 2)),
      domeniche_lavorate: 0,
      festivita_lavorate_non_maggiorate: [],
      ore_badge_vs_cedolino: {
        badge: (d.ore_ordinarie || 0) + (d.ore_straordinarie || 0),
        cedolino: (d.ore_ordinarie || 0) + (d.ore_straordinarie || 0)
      }
    }
  };
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', name: 'X-PAY CHECK Legacy Backend', mode: 'legacy', timestamp: new Date().toISOString() });
});

app.get('/api/v1/knowledge/manifest', (_req, res) => {
  res.json({
    files: [
      { ccnl_id: 'COMMERCIO_2024', version: '3', hash: 'sha256-demo-comm-3', filename: 'COMMERCIO_2024_rev3.md' }
    ],
    releasedAt: new Date().toISOString()
  });
});

app.get('/api/v1/license/status', (_req, res) => {
  res.json({ tier: 'free', status: 'active', expiresAt: null, mode: 'legacy' });
});

app.post('/api/v1/backup/checkpoint', (req, res) => {
  const item = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...req.body };
  checkpoints.push(item);
  res.status(201).json({ success: true, checkpoint: item });
});

app.get('/api/v1/backup/checkpoint', (_req, res) => {
  res.json({ items: checkpoints });
});

app.post('/api/v1/audit/run', (req, res) => {
  try {
    const report = runAudit(req.body || {});
    res.json(report);
  } catch (e) {
    res.status(400).json({ error: 'Payload cedolino non valido', detail: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`[X-PAY CHECK][legacy] API pronta su http://localhost:${PORT}`);
});
