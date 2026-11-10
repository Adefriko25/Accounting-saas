import { NextResponse } from 'next/server';
import { initializeDatabase, deleteTransaction } from '@/lib/db';

// DELETE /api/transactions/[id]
export async function DELETE(request, { params }) {
  try {
    await initializeDatabase();
    const txId = parseInt(params.id);
    await deleteTransaction(txId);
    return NextResponse.json({ message: `Transaksi dengan ID ${txId} berhasil dihapus!` });
  } catch (error) {
    const status = error.message.includes('tidak ditemukan') ? 404 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }
}
