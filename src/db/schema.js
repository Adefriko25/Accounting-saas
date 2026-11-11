import { getDb } from './index';

let initialized = false;

/**
 * Inisialisasi skema tabel database (hanya dieksekusi sekali jika belum ada)
 */
export async function initializeDatabase() {
  if (initialized) return;

  const sql = getDb();

  await sql`
    CREATE TABLE IF NOT EXISTS accounts (
      id SERIAL PRIMARY KEY,
      account VARCHAR(255) UNIQUE NOT NULL,
      type VARCHAR(50) NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      date DATE NOT NULL,
      debit VARCHAR(255) NOT NULL,
      credit VARCHAR(255) NOT NULL,
      amount DECIMAL(15,2) NOT NULL,
      description TEXT DEFAULT ''
    )
  `;

  initialized = true;
}
