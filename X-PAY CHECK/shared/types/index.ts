export type Severity = 'CRITICO' | 'WARNING' | 'INFO' | 'PASS';

export interface CedolinoRaw {
  mese_riferimento: string;
  tipo_documento: 'cedolino' | string;
  dati_testuali: {
    ragione_sociale?: string;
    p_iva?: string;
    cf_lavoratore?: string;
    ccnl_applicato?: string;
    livello?: string;
    qualifica?: string;
  };
  dati_numerici: {
    giorni_lavorati: number;
    ore_ordinarie: number;
    ore_straordinarie: number;
    ore_notturne: number;
    ore_festive: number;
    paga_base: number;
    scatti_anzianita: number;
    superminimo: number;
    lordo: number;
    netto: number;
    trattamento_integrativo: number;
    irpef: number;
    addizionale_regionale: number;
    addizionale_comunale: number;
    contributi_inps_dipendente: number;
    contributi_inail: number;
    tfr_maturato: number;
    ferie_maturate_gg: number;
    ferie_usate_gg: number;
    rol_maturati_gg: number;
    rol_usati_gg: number;
    maggiorazione_notturna: number;
    maggiorazione_festiva: number;
    maggiorazione_straordinaria: number;
  };
  assenze: {
    malattia_gg: number;
    ferie_gg: number;
    rol_gg: number;
    maternita_gg: number;
    cassa_integrazione_gg: number;
  };
}

export interface RuleResult {
  regola_id: string;
  nome: string;
  stato: 'PASS' | 'WARNING' | 'CRITICO' | 'INFO';
  valore_atteso: number | string | null;
  valore_rilevato: number | string | null;
  delta: number | null;
  severita: Severity;
  messaggio: string;
  riferimento_ccnl?: string;
  suggerimento?: string;
}

export interface AuditOutput {
  audit_id: string;
  timestamp: string;
  ccnl: string;
  livello: string;
  severita_massima: Exclude<Severity, 'PASS'> | 'PASS';
  riepilogo: {
    totale_controlli: number;
    critici: number;
    warning: number;
    info: number;
    pass: number;
  };
  dettaglio: RuleResult[];
  dati_investigativi: {
    notti_totali_mese: number;
    domeniche_lavorate: number;
    festivita_lavorate_non_maggiorate: string[];
    ore_badge_vs_cedolino: { badge: number; cedolino: number };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
