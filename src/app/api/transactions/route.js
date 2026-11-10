import { NextResponse } from 'next/server';
import { initializeDatabase, getTransactions, addTransaction } from '@/lib/db';

// GET /api/transactions
export async function GET() {
  try {
    await initializeDatabase();
    const transactions = await getTransactions();
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/transactions
export async function POST(request) {
  try {
    await initializeDatabase();
    const data = await request.json();
    const { date, debit, credit, amount, description } = data;

    if (!date || !debit || !credit || amount === undefined) {
      return NextResponse.json({ error: 'Semua field transaksi wajib diisi' }, { status: 400 });
    }
    if (debit === credit) {
      return NextResponse.json({ error: 'Akun Debit dan Credit tidak boleh sama!' }, { status: 400 });
    }
    if (parseFloat(amount) <= 0) {
      return NextResponse.json({ error: 'Nominal harus lebih dari 0!' }, { status: 400 });
    }

    await addTransaction(date, debit, credit, parseFloat(amount), description || '');
    return NextResponse.json({ message: 'Transaksi berhasil disimpan!' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
