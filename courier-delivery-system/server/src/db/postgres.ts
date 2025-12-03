import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { rejectUnauthorized: false } // включите при необходимости
});

export default pool;
export type PgClient = import('pg').PoolClient;