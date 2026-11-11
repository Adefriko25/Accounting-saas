import { initializeDatabase } from '@/db/schema';
import { resetAllData } from '@/backend/services/transactions.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

// POST /api/reset
export async function POST() {
  try {
    await initializeDatabase();
    const result = await resetAllData();
    return successResponse(result);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}
