import { NextResponse } from 'next/server';
import { initializeDatabase, getAccounts, getTransactions } from '@/lib/db';
import { calculateCashflow } from '@/lib/accounting';

export async function GET(request) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(request.url);
    const account = searchParams.get('account');

    const [accounts, transactions] = await Promise.all([getAccounts(), getTransactions()]);
    return NextResponse.json(calculateCashflow(transactions, accounts, account));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
