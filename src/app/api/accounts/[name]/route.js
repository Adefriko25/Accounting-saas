import { NextResponse } from 'next/server';
import { initializeDatabase, deleteAccount } from '@/lib/db';

// DELETE /api/accounts/[name]
export async function DELETE(request, { params }) {
  try {
    await initializeDatabase();
    const accountName = decodeURIComponent(params.name);
    await deleteAccount(accountName);
    return NextResponse.json({ message: `Akun '${accountName}' berhasil dihapus!` });
  } catch (error) {
    const status = error.message.includes('tidak ditemukan') ? 404 : 400;
    return NextResponse.json({ error: error.message }, { status });
  }
}
