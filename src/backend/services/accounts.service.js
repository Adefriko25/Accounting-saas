import {
  queryAllAccounts,
  queryInsertAccount,
  queryAccountUsage,
  queryAccountByName,
  queryDeleteAccount
} from '@/db/queries/accounts';

/**
 * Service mengambil semua akun
 */
export async function getAllAccounts() {
  return await queryAllAccounts();
}

/**
 * Service membuat akun baru
 */
export async function createAccount({ account, type }) {
  if (!account || !type) {
    throw new Error('Nama dan tipe akun wajib diisi');
  }

  const trimmedName = account.trim();
  if (!trimmedName) {
    throw new Error('Nama akun tidak boleh kosong');
  }

  const validTypes = ['Asset', 'Liability', 'Equity', 'Revenue', 'COGS', 'Expense'];
  if (!validTypes.includes(type)) {
    throw new Error(`Tipe akun tidak valid. Harus salah satu dari: ${validTypes.join(', ')}`);
  }

  await queryInsertAccount(trimmedName, type);
  return { message: `Akun '${trimmedName}' berhasil ditambahkan!` };
}

/**
 * Service menghapus akun dengan proteksi integritas transaksi
 */
export async function removeAccount(accountName) {
  if (!accountName) {
    throw new Error('Nama akun wajib diisi');
  }

  // Cek apakah akun digunakan dalam transaksi
  const used = await queryAccountUsage(accountName);
  if (used && used.length > 0) {
    throw new Error('Akun tidak dapat dihapus karena masih digunakan dalam riwayat transaksi!');
  }

  // Cek apakah akun terdaftar
  const existing = await queryAccountByName(accountName);
  if (!existing || existing.length === 0) {
    throw new Error('Akun tidak ditemukan!');
  }

  await queryDeleteAccount(accountName);
  return { message: `Akun '${accountName}' berhasil dihapus!` };
}
