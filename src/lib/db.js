import { neon } from '@neondatabase/serverless';

// Cached SQL connection
let sql = null;

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

// Initialize tables on first call
export async function initializeDatabase() {
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
}

// ==========================================
// ACCOUNT QUERIES
// ==========================================
export async function getAccounts() {
  const sql = getDb();
  return await sql`SELECT account, type FROM accounts ORDER BY account`;
}

export async function addAccount(account, type) {
  const sql = getDb();
  await sql`INSERT INTO accounts (account, type) VALUES (${account}, ${type})`;
}

export async function deleteAccount(accountName) {
  const sql = getDb();
  
  // Check if account is used in transactions
  const used = await sql`
    SELECT id FROM transactions 
    WHERE debit = ${accountName} OR credit = ${accountName} 
    LIMIT 1
  `;
  if (used.length > 0) {
    throw new Error('Akun tidak dapat dihapus karena masih digunakan dalam riwayat transaksi!');
  }
  
  // Check if account exists
  const exists = await sql`SELECT account FROM accounts WHERE account = ${accountName}`;
  if (exists.length === 0) {
    throw new Error('Akun tidak ditemukan!');
  }
  
  await sql`DELETE FROM accounts WHERE account = ${accountName}`;
}

// ==========================================
// TRANSACTION QUERIES
// ==========================================
export async function getTransactions() {
  const sql = getDb();
  const rows = await sql`
    SELECT id, date, debit, credit, amount, description 
    FROM transactions 
    ORDER BY date ASC, id ASC
  `;
  return rows.map(tx => ({
    ...tx,
    date: tx.date instanceof Date 
      ? tx.date.toISOString().split('T')[0] 
      : String(tx.date).split('T')[0],
    amount: parseFloat(tx.amount)
  }));
}

export async function addTransaction(date, debit, credit, amount, description) {
  const sql = getDb();
  await sql`
    INSERT INTO transactions (date, debit, credit, amount, description) 
    VALUES (${date}, ${debit}, ${credit}, ${amount}, ${description})
  `;
}

export async function deleteTransaction(txId) {
  const sql = getDb();
  const exists = await sql`SELECT id FROM transactions WHERE id = ${txId}`;
  if (exists.length === 0) {
    throw new Error('Transaksi tidak ditemukan');
  }
  await sql`DELETE FROM transactions WHERE id = ${txId}`;
}

// ==========================================
// RESET DATABASE
// ==========================================
export async function resetDatabase() {
  const sql = getDb();
  await sql`DELETE FROM transactions`;
  await sql`DELETE FROM accounts`;
}
