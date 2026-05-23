export type AnalysisDepth = 'basic' | 'standard' | 'deep' | 'quantum';

export type AgentType = 'extractor' | 'accountant' | 'auditor' | 'swarm';

export type AgentStatus = 'idle' | 'running' | 'completed' | 'error' | 'consulting';

export type AnomalySeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export interface User {
  id: string;
  email: string;
  role: 'employee' | 'hr' | 'auditor' | 'legal' | 'admin';
  webauthnCredential?: string;
}

export interface UploadedDocument {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  pageCount: number;
  ocrConfidence: number;
  status: 'uploaded' | 'processing' | 'extracted' | 'error';
  createdAt: string;
}

export interface PayrollData {
  id: string;
  documentId: string;
  employeeName: string;
  fiscalCode: string;
  month: number;
  year: number;
  ccnlCode?: string;
  level?: string;
  grossSalary: number;
  netSalary: number;
  inpsContribution: number;
  inailContribution: number;
  irpefWithheld: number;
  tfrAccrued: number;
  hoursWorked?: number;
  overtimeHours?: number;
  overtimePay?: number;
  extractionConfidence: number;
  isReconstructed?: boolean;
}

export interface Anomaly {
  id: string;
  payrollId: string;
  agent: AgentType;
  severity: AnomalySeverity;
  field: string;
  expected: string;
  actual: string;
  description: string;
  legalReference?: string;
  createdAt: string;
}

export interface ReconstructedEntry {
  id: string;
  date: string;
  hours: number;
  isReconstructed: true;
  confidence: number;
  patternUsed: string;
  validatedBy?: string;
}

export interface AgentMessage {
  agent: AgentType;
  status: AgentStatus;
  message: string;
  progress?: number;
  data?: Record<string, unknown>;
  timestamp: string;
}

export interface AnalysisJob {
  id: string;
  userId: string;
  depth: AnalysisDepth;
  status: 'pending' | 'extracting' | 'accounting' | 'auditing' | 'completed' | 'error';
  documents: UploadedDocument[];
  payrolls: PayrollData[];
  anomalies: Anomaly[];
  reconstructed: ReconstructedEntry[];
  agentMessages: AgentMessage[];
  reliabilityScore: number;
  blockchainTxHash?: string;
  startedAt: string;
  completedAt?: string;
}

export interface NLQueryResult {
  query: string;
  answer: string;
  sources: string[];
  confidence: number;
  generatedBrief?: string;
}

export interface CollabCursor {
  userId: string;
  userName: string;
  x: number;
  y: number;
  color: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  entryPoint: string;
  permissions: string[];
}
