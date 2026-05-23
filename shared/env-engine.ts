/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  RYB Zero-Stress Environment Engine v20.0                        ║
 * ║  "L'utente clona, lancia, funziona. Zero stress."              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 * 
 * Logica a cascata:
 *  1. Cerca .env (locale, personalizzato)
 *  2. Se manca → carica .env.example (default zero-config)
 *  3. Se manca anche quello → genera valori smart in-memory
 *  4. Mai crash. Mai blocco. Mai configurazione manuale.
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface EnvConfig {
  source: 'dotenv' | 'dotenv-example' | 'generated';
  path: string;
  vars: Record<string, string>;
}

const DEFAULTS: Record<string, string> = {
  DB_HOST: 'localhost',
  DB_PORT: '5432',
  DB_NAME: 'ryb_development',
  DB_USER: 'ryb_dev',
  DB_PASSWORD: 'ryb_dev_secret_2026',
  DB_POOL_SIZE: '10',
  DB_SSL: 'false',

  REDIS_HOST: 'localhost',
  REDIS_PORT: '6379',
  REDIS_PASSWORD: '',
  REDIS_DB: '0',

  JWT_SECRET: '',
  JWT_EXPIRES_IN: '7d',
  JWT_REFRESH_EXPIRES_IN: '30d',

  MINIO_ENDPOINT: 'localhost',
  MINIO_PORT: '9000',
  MINIO_ACCESS_KEY: 'minioadmin',
  MINIO_SECRET_KEY: 'minioadmin',
  MINIO_BUCKET: 'ryb-uploads',
  MINIO_USE_SSL: 'false',

  NODE_ENV: 'development',
  PORT: '3001',
  FRONTEND_URL: 'http://localhost:5173',
  MOBILE_URL: 'http://localhost:5174',

  AI_PORT: '3002',
  AI_STRATEGY: 'auto',
  OLLAMA_HOST: 'http://localhost:11434',
  HUGGINGFACE_API_TOKEN: '',

  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  SMTP_USER: '',
  SMTP_PASS: '',
  EMAIL_FROM: 'noreply@ryb.local',

  LOG_LEVEL: 'info',
  LOG_FORMAT: 'pretty',

  RATE_LIMIT_WINDOW_MS: '900000',
  RATE_LIMIT_MAX: '100',
  CORS_ORIGIN: 'http://localhost:5173',

  ENABLE_AI: 'true',
  ENABLE_EMAIL: 'true',
  ENABLE_UPLOADS: 'true',
  ENABLE_REALTIME: 'true',
};

function parseEnvFile(filePath: string): Record<string, string> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const vars: Record<string, string> = {};

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    vars[key] = value;
  }
  return vars;
}

function generateSecureSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}

function smartDefaults(): Record<string, string> {
  const vars = { ...DEFAULTS };
  if (!vars.JWT_SECRET) vars.JWT_SECRET = generateSecureSecret();

  if (process.env.CODESPACE_NAME || process.env.GITHUB_CODESPACE_TOKEN) {
    vars.NODE_ENV = 'codespaces';
    vars.CORS_ORIGIN = '*';
    vars.FRONTEND_URL = `https://${process.env.CODESPACE_NAME}-5173.github.dev`;
    console.log('🔷 Rilevato ambiente GitHub Codespaces — CORS aperto');
  }

  try {
    fs.accessSync('/.dockerenv');
    vars.NODE_ENV = 'docker';
    vars.DB_HOST = 'postgres';
    vars.REDIS_HOST = 'redis';
    vars.MINIO_ENDPOINT = 'minio';
    console.log('🐳 Rilevato ambiente Docker — host interni configurati');
  } catch { /* non siamo in Docker */ }

  return vars;
}

export function loadEnv(projectRoot: string = process.cwd()): EnvConfig {
  const envPath = path.join(projectRoot, '.env');
  const examplePath = path.join(projectRoot, '.env.example');

  if (fs.existsSync(envPath)) {
    const vars = parseEnvFile(envPath);
    console.log('✅ Caricata configurazione da .env (personalizzata)');
    return { source: 'dotenv', path: envPath, vars };
  }

  if (fs.existsSync(examplePath)) {
    const vars = parseEnvFile(examplePath);
    const smart = smartDefaults();
    for (const [key, val] of Object.entries(vars)) {
      if (!val && smart[key]) vars[key] = smart[key];
    }
    console.log('⚠️  .env locale assente. Carico i valori di default da .env.example (zero-config)');
    console.log('💡 Suggerimento: cp .env.example .env se vuoi personalizzare');
    return { source: 'dotenv-example', path: examplePath, vars };
  }

  const vars = smartDefaults();
  console.log('🔧 Nessun file .env trovato. Generata configurazione smart in-memory (zero-config)');
  return { source: 'generated', path: 'in-memory', vars };
}

export function applyEnv(config: EnvConfig): void {
  for (const [key, value] of Object.entries(config.vars)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function getEnv(key: string, fallback?: string): string {
  return process.env[key] || fallback || '';
}

export function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Variabile d'ambiente richiesta mancante: ${key}`);
  return val;
}

const autoConfig = loadEnv();
applyEnv(autoConfig);

console.log(`🔐 JWT_SECRET: ${process.env.JWT_SECRET ? 'configurato (' + process.env.JWT_SECRET.slice(0, 8) + '...)' : 'MANCANTE'}`);
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`🎯 AI Strategy: ${process.env.AI_STRATEGY}`);
