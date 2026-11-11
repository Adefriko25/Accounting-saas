import { initializeDatabase } from '@/db/schema';
import { getAllAccounts } from '@/backend/services/accounts.service';
import { getAllTransactions } from '@/backend/services/transactions.service';
import { calculateBalanceSheetData } from '@/backend/services/accounting.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

// GET /api/balance-sheet
export async function GET() {
  try {
    await initializeDatabase();
    const [accounts, transactions] = await Promise.all([
      getAllAccounts(),
      getAllTransactions()
    ]);
    const balanceSheet = calculateBalanceSheetData(transactions, accounts);
    return successResponse(balanceSheet);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
