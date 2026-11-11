import { initializeDatabase } from '@/db/schema';
import { getAllAccounts } from '@/backend/services/accounts.service';
import { getAllTransactions } from '@/backend/services/transactions.service';
import { calculateCashflowData } from '@/backend/services/accounting.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

// GET /api/cashflow?account=...
export async function GET(request) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(request.url);
    const account = searchParams.get('account');

    const [accounts, transactions] = await Promise.all([
      getAllAccounts(),
      getAllTransactions()
    ]);
    const cashflow = calculateCashflowData(transactions, accounts, account);
    return successResponse(cashflow);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
