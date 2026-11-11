import {
  queryAllTransactions,
  queryInsertTransaction,
  queryTransactionById,
  queryDeleteTransaction,
  queryResetDatabase
} from '@/db/queries/transactions';

/**
 * Service mengambil semua riwayat transaksi
 */
export async function getAllTransactions() {
  return await queryAllTransactions();
}

/**
 * Service membuat transaksi baru
 */
export async function createTransaction({ date, debit, credit, amount, description }) {
  if (!date || !debit || !credit || amount === undefined || amount === null || amount === '') {
    throw new Error('Semua field transaksi wajib diisi');
  }

  if (debit === credit) {
    throw new Error('Akun Debit dan Credit tidak boleh sama!');
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    throw new Error('Nominal transaksi harus lebih dari 0!');
  }

  await queryInsertTransaction(date, debit, credit, numericAmount, description || '');
  return { message: 'Transaksi berhasil disimpan!' };
}

/**
 * Service menghapus transaksi berdasarkan ID
 */
export async function removeTransaction(txId) {
  const numericId = parseInt(txId, 10);
  if (isNaN(numericId)) {
    throw new Error('ID transaksi tidak valid');
  }

  const existing = await queryTransactionById(numericId);
  if (!existing || existing.length === 0) {
    throw new Error('Transaksi tidak ditemukan');
  }

  await queryDeleteTransaction(numericId);
  return { message: `Transaksi dengan ID ${numericId} berhasil dihapus!` };
}

/**
 * Service reset total database (Danger Zone)
 */
export async function resetAllData() {
  await queryResetDatabase();
  return { message: 'Seluruh data pembukuan & daftar akun berhasil di-reset!' };
}
