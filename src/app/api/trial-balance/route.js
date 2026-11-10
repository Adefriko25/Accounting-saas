import { NextResponse } from 'next/server';
import { initializeDatabase, getAccounts, getTransactions } from '@/lib/db';
import { calculateTrialBalance } from '@/lib/accounting';

export async function GET() {
  try {
    await initializeDatabase();
    const [accounts, transactions] = await Promise.all([getAccounts(), getTransactions()]);
    return NextResponse.json(calculateTrialBalance(transactions, accounts));
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
