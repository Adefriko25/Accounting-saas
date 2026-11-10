import { NextResponse } from 'next/server';
import { initializeDatabase, getAccounts, getTransactions } from '@/lib/db';
import { calculateDashboard } from '@/lib/accounting';

export async function GET() {
  try {
    await initializeDatabase();
    const [accounts, transactions] = await Promise.all([getAccounts(), getTransactions()]);
    const result = calculateDashboard(transactions, accounts);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
