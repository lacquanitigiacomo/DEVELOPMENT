export type Severity = 'CRITICO' | 'WARNING' | 'INFO' | 'PASS';

export interface CedolinoRaw {
  mese_riferimento: string;
  tipo_documento: string;
  dati_testuali: Record<string, string | undefined>;
  dati_numerici: Record<string, number>;
  assenze: Record<string, number>;
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
  severita_massima: Severity;
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
