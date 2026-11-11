import { initializeDatabase } from '@/db/schema';
import { removeTransaction } from '@/backend/services/transactions.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

// DELETE /api/transactions/[id]
export async function DELETE(request, { params }) {
  try {
    await initializeDatabase();
    const result = await removeTransaction(params.id);
    return successResponse(result);
  } catch (error) {
    const isNotFound = error.message.includes('tidak ditemukan');
    const isBadRequest = error.message.includes('tidak valid');
    const status = isNotFound ? 404 : (isBadRequest ? 400 : 500);
    return errorResponse(error.message, status);
  }
}
