-- Inizializzazione database RYB Development
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Schema audit
CREATE SCHEMA IF NOT EXISTS audit;

-- Tabella jobs
CREATE TABLE IF NOT EXISTS audit.jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID,
    depth VARCHAR(20) NOT NULL DEFAULT 'standard',
    status VARCHAR(50) DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    reliability_score INTEGER,
    results_summary JSONB,
    blockchain_tx_hash VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabella documenti
CREATE TABLE IF NOT EXISTS audit.documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID REFERENCES audit.jobs(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    storage_path VARCHAR(500),
    ocr_confidence DECIMAL(5,2),
    extracted_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indici
CREATE INDEX IF NOT EXISTS idx_jobs_status ON audit.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_started_at ON audit.jobs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_documents_job_id ON audit.documents(job_id);

-- Seed dati di test
INSERT INTO audit.jobs (job_id, depth, status, reliability_score, results_summary)
VALUES 
    ('test_job_001', 'standard', 'completed', 85, '{"documents": 3, "anomalies": 2}'),
    ('test_job_002', 'deep', 'completed', 72, '{"documents": 5, "anomalies": 7}')
ON CONFLICT (job_id) DO NOTHING;
