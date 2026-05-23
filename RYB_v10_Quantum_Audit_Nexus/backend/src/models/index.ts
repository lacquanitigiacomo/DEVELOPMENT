import { drizzle } from 'drizzle-orm/node-postgres';
import { Client } from 'pg';

const client = new Client({
  host: process.env.DB_HOST || 'localhost',
  port: 5432,
  user: process.env.DB_USER || 'ryb',
  password: process.env.DB_PASSWORD || 'ryb_secret_2026',
  database: process.env.DB_NAME || 'ryb_audit',
});

export const db = drizzle(client);

export async function initializeDatabase() {
  await client.connect();
  console.log('PostgreSQL connected');
}