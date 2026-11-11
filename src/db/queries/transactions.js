import { getDb } from '../index';

/**
 * Mengambil semua transaksi keuangan
 */
export async function queryAllTransactions() {
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

/**
 * Menambahkan transaksi baru
 */
export async function queryInsertTransaction(date, debit, credit, amount, description) {
  const sql = getDb();
  await sql`
    INSERT INTO transactions (date, debit, credit, amount, description) 
    VALUES (${date}, ${debit}, ${credit}, ${amount}, ${description})
  `;
}

/**
 * Mengecek apakah transaksi dengan ID tertentu ada
 */
export async function queryTransactionById(txId) {
  const sql = getDb();
  return await sql`SELECT id FROM transactions WHERE id = ${txId} LIMIT 1`;
}

/**
 * Menghapus transaksi berdasarkan ID
 */
export async function queryDeleteTransaction(txId) {
  const sql = getDb();
  await sql`DELETE FROM transactions WHERE id = ${txId}`;
}

/**
 * Reset total seluruh data database
 */
export async function queryResetDatabase() {
  const sql = getDb();
  await sql`DELETE FROM transactions`;
  await sql`DELETE FROM accounts`;
}
