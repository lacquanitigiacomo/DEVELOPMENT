import { randomUUID } from 'crypto';
import type { AuditOutput, CedolinoRaw, RuleResult } from '../types/audit';

const EPSILON = 0.01;

function toFixed2(n: number): number {
  return Math.round(n * 100) / 100;
}

function makeRule(result: RuleResult): RuleResult {
  return result;
}

export function runAudit(cedolino: CedolinoRaw): AuditOutput {
  const d = cedolino.dati_numerici;
  const assenze = cedolino.assenze;

  const irpefTot = d.irpef + d.addizionale_regionale + d.addizionale_comunale;
  const nettoCalcolato = toFixed2(d.lordo - irpefTot - d.contributi_inps_dipendente - d.contributi_inail);
  const deltaNetto = toFixed2(d.netto - nettoCalcolato);

  const pagaOraria = d.ore_ordinarie > 0 ? d.paga_base / d.ore_ordinarie : 0;
  const expectedNotturna = toFixed2(d.ore_notturne * pagaOraria * 0.25);
  const expectedFestiva = toFixed2(d.ore_festive * pagaOraria * 0.3);

  const giorniMese = 30;
  const giorniContati = d.giorni_lavorati + assenze.malattia_gg + assenze.ferie_gg + assenze.rol_gg + assenze.maternita_gg + assenze.cassa_integrazione_gg;

  const rules: RuleResult[] = [
    makeRule({
      regola_id: 'R001',
      nome: 'Coerenza Lordo-Netto',
      stato: Math.abs(deltaNetto) <= EPSILON ? 'PASS' : 'CRITICO',
      valore_atteso: nettoCalcolato,
      valore_rilevato: d.netto,
      delta: deltaNetto,
      severita: Math.abs(deltaNetto) <= EPSILON ? 'PASS' : 'CRITICO',
      messaggio: Math.abs(deltaNetto) <= EPSILON
        ? 'Il netto calcolato coincide con il netto riportato.'
        : 'Il netto riportato non coincide con il calcolo base di imposte e contributi.'
    }),
    makeRule({
      regola_id: 'R003',
      nome: 'Contributi INPS %',
      stato: d.lordo > 0 && Math.abs((d.contributi_inps_dipendente / d.lordo) - 0.0919) <= 0.02 ? 'PASS' : 'WARNING',
      valore_atteso: toFixed2(d.lordo * 0.0919),
      valore_rilevato: d.contributi_inps_dipendente,
      delta: toFixed2(d.contributi_inps_dipendente - d.lordo * 0.0919),
      severita: d.lordo > 0 && Math.abs((d.contributi_inps_dipendente / d.lordo) - 0.0919) <= 0.02 ? 'PASS' : 'WARNING',
      messaggio: 'Verifica indicativa sull’aliquota contributiva INPS dipendente (~9.19%).'
    }),
    makeRule({
      regola_id: 'R005',
      nome: 'Congruenza Giorni',
      stato: giorniContati === giorniMese ? 'PASS' : 'CRITICO',
      valore_atteso: giorniMese,
      valore_rilevato: giorniContati,
      delta: giorniContati - giorniMese,
      severita: giorniContati === giorniMese ? 'PASS' : 'CRITICO',
      messaggio: giorniContati === giorniMese ? 'Totale giorni coerente.' : 'Somma giorni lavorati/assenze non coerente con i giorni del mese.'
    }),
    makeRule({
      regola_id: 'R103',
      nome: 'Maggiorazione Notturna',
      stato: d.ore_notturne === 0 || d.maggiorazione_notturna + EPSILON >= expectedNotturna ? 'PASS' : 'WARNING',
      valore_atteso: expectedNotturna,
      valore_rilevato: d.maggiorazione_notturna,
      delta: toFixed2(d.maggiorazione_notturna - expectedNotturna),
      severita: d.ore_notturne === 0 || d.maggiorazione_notturna + EPSILON >= expectedNotturna ? 'PASS' : 'WARNING',
      messaggio: 'Controllo della maggiorazione notturna rispetto al 25% della paga oraria media.',
      riferimento_ccnl: 'Art. 42 — Lavoro notturno'
    }),
    makeRule({
      regola_id: 'R104',
      nome: 'Maggiorazione Festiva',
      stato: d.ore_festive === 0 || d.maggiorazione_festiva + EPSILON >= expectedFestiva ? 'PASS' : 'WARNING',
      valore_atteso: expectedFestiva,
      valore_rilevato: d.maggiorazione_festiva,
      delta: toFixed2(d.maggiorazione_festiva - expectedFestiva),
      severita: d.ore_festive === 0 || d.maggiorazione_festiva + EPSILON >= expectedFestiva ? 'PASS' : 'WARNING',
      messaggio: 'Controllo della maggiorazione festiva rispetto al 30% della paga oraria media.',
      riferimento_ccnl: 'Art. 43 — Lavoro festivo'
    })
  ];

  const critici = rules.filter(r => r.severita === 'CRITICO').length;
  const warning = rules.filter(r => r.severita === 'WARNING').length;
  const info = rules.filter(r => r.severita === 'INFO').length;
  const pass = rules.filter(r => r.severita === 'PASS').length;

  const severitaMassima = critici > 0 ? 'CRITICO' : warning > 0 ? 'WARNING' : info > 0 ? 'INFO' : 'PASS';

  return {
    audit_id: randomUUID(),
    timestamp: new Date().toISOString(),
    ccnl: cedolino.dati_testuali.ccnl_applicato || 'NON_RILEVATO',
    livello: cedolino.dati_testuali.livello || 'N/A',
    severita_massima: severitaMassima,
    riepilogo: {
      totale_controlli: rules.length,
      critici,
      warning,
      info,
      pass
    },
    dettaglio: rules,
    dati_investigativi: {
      notti_totali_mese: Math.max(0, Math.round(d.ore_notturne / 2)),
      domeniche_lavorate: 0,
      festivita_lavorate_non_maggiorate: d.ore_festive > 0 && expectedFestiva > d.maggiorazione_festiva ? [cedolino.mese_riferimento + '-25'] : [],
      ore_badge_vs_cedolino: { badge: d.ore_ordinarie + d.ore_straordinarie, cedolino: d.ore_ordinarie + d.ore_straordinarie }
    }
  };
}
