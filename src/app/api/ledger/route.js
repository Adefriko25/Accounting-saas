import { NextResponse } from 'next/server';
import { initializeDatabase, getAccounts, getTransactions } from '@/lib/db';
import { calculateLedger } from '@/lib/accounting';

export async function GET(request) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(request.url);
    const account = searchParams.get('account');

    if (!account) {
      return NextResponse.json({ error: 'Parameter account wajib diisi' }, { status: 400 });
    }

    const [accounts, transactions] = await Promise.all([getAccounts(), getTransactions()]);
    const result = calculateLedger(transactions, accounts, account);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
