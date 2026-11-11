import { initializeDatabase } from '@/db/schema';
import { getAllAccounts } from '@/backend/services/accounts.service';
import { getAllTransactions } from '@/backend/services/transactions.service';
import { calculateDashboardData } from '@/backend/services/accounting.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

// GET /api/dashboard
export async function GET() {
  try {
    await initializeDatabase();
    const [accounts, transactions] = await Promise.all([
      getAllAccounts(),
      getAllTransactions()
    ]);
    const dashboardData = calculateDashboardData(transactions, accounts);
    return successResponse(dashboardData);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
