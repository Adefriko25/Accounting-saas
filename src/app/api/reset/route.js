import { NextResponse } from 'next/server';
import { initializeDatabase, resetDatabase } from '@/lib/db';

export async function POST() {
  try {
    await initializeDatabase();
    await resetDatabase();
    return NextResponse.json({ message: 'Seluruh data pembukuan & daftar akun berhasil di-reset!' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
