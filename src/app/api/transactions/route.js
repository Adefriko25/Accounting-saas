import { initializeDatabase } from '@/db/schema';
import { getAllTransactions, createTransaction } from '@/backend/services/transactions.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

// GET /api/transactions
export async function GET() {
  try {
    await initializeDatabase();
    const transactions = await getAllTransactions();
    return successResponse(transactions);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

// POST /api/transactions
export async function POST(request) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const result = await createTransaction(body);
    return successResponse(result, 201);
  } catch (error) {
    const isValidation = error.message.includes('wajib') || 
                         error.message.includes('sama') || 
                         error.message.includes('Nominal');
    return errorResponse(error.message, isValidation ? 400 : 500);
  }
}
