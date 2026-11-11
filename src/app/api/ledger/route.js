import { initializeDatabase } from '@/db/schema';
import { getAllAccounts } from '@/backend/services/accounts.service';
import { getAllTransactions } from '@/backend/services/transactions.service';
import { calculateLedgerData } from '@/backend/services/accounting.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

// GET /api/ledger?account=...
export async function GET(request) {
  try {
    await initializeDatabase();
    const { searchParams } = new URL(request.url);
    const account = searchParams.get('account');

    if (!account) {
      return errorResponse('Parameter account wajib diisi', 400);
    }

    const [accounts, transactions] = await Promise.all([
      getAllAccounts(),
      getAllTransactions()
    ]);
    const ledgerData = calculateLedgerData(transactions, accounts, account);

    if (ledgerData.error) {
      return errorResponse(ledgerData.error, 404);
    }
    return successResponse(ledgerData);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
