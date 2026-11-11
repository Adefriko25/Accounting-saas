import { getDb } from '../index';

/**
 * Mengambil semua akun terdaftar terurut alfabet
 */
export async function queryAllAccounts() {
  const sql = getDb();
  return await sql`SELECT account, type FROM accounts ORDER BY account ASC`;
}

/**
 * Menambahkan akun baru
 */
export async function queryInsertAccount(account, type) {
  const sql = getDb();
  await sql`INSERT INTO accounts (account, type) VALUES (${account}, ${type})`;
}

/**
 * Mengecek apakah akun digunakan dalam riwayat transaksi
 */
export async function queryAccountUsage(accountName) {
  const sql = getDb();
  return await sql`
    SELECT id FROM transactions 
    WHERE debit = ${accountName} OR credit = ${accountName} 
    LIMIT 1
  `;
}

/**
 * Mengecek apakah akun terdaftar
 */
export async function queryAccountByName(accountName) {
  const sql = getDb();
  return await sql`SELECT account, type FROM accounts WHERE account = ${accountName} LIMIT 1`;
}

/**
 * Menghapus akun berdasarkan nama
 */
export async function queryDeleteAccount(accountName) {
  const sql = getDb();
  await sql`DELETE FROM accounts WHERE account = ${accountName}`;
}
