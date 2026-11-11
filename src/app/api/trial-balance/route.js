import { initializeDatabase } from '@/db/schema';
import { getAllAccounts } from '@/backend/services/accounts.service';
import { getAllTransactions } from '@/backend/services/transactions.service';
import { calculateTrialBalanceData } from '@/backend/services/accounting.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

// GET /api/trial-balance
export async function GET() {
  try {
    await initializeDatabase();
    const [accounts, transactions] = await Promise.all([
      getAllAccounts(),
      getAllTransactions()
    ]);
    const trialBalance = calculateTrialBalanceData(transactions, accounts);
    return successResponse(trialBalance);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
