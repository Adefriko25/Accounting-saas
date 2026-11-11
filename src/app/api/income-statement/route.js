import { initializeDatabase } from '@/db/schema';
import { getAllAccounts } from '@/backend/services/accounts.service';
import { getAllTransactions } from '@/backend/services/transactions.service';
import { calculateIncomeStatementData } from '@/backend/services/accounting.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

// GET /api/income-statement
export async function GET() {
  try {
    await initializeDatabase();
    const [accounts, transactions] = await Promise.all([
      getAllAccounts(),
      getAllTransactions()
    ]);
    const incomeStatement = calculateIncomeStatementData(transactions, accounts);
    return successResponse(incomeStatement);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
