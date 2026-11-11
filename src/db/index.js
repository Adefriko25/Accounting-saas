import { neon } from '@neondatabase/serverless';

// Cached SQL connection instance
let sql = null;

/**
 * Mendapatkan koneksi SQL Neon Serverless
 */
export function getDb() {
  if (!sql) {
    const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL atau POSTGRES_URL belum diatur di Environment Variables!');
    }
    sql = neon(databaseUrl);
  }
  return sql;
}
