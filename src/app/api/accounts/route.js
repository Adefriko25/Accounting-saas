import { initializeDatabase } from '@/db/schema';
import { getAllAccounts, createAccount } from '@/backend/services/accounts.service';
import { successResponse, errorResponse } from '@/backend/utils/response';

// GET /api/accounts
export async function GET() {
  try {
    await initializeDatabase();
    const accounts = await getAllAccounts();
    return successResponse(accounts);
  } catch (error) {
    return errorResponse(error.message, 500);
  }
}

// POST /api/accounts
export async function POST(request) {
  try {
    await initializeDatabase();
    const body = await request.json();
    const result = await createAccount(body);
    return successResponse(result, 201);
  } catch (error) {
    const isConflict = error.message.includes('duplicate') || error.message.includes('unique');
    const status = isConflict ? 409 : (error.message.includes('wajib') ? 400 : 500);
    const message = isConflict ? 'Akun sudah terdaftar!' : error.message;
    return errorResponse(message, status);
  }
}
