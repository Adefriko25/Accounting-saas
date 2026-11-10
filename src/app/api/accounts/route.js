import { NextResponse } from 'next/server';
import { initializeDatabase, getAccounts, addAccount } from '@/lib/db';

// GET /api/accounts
export async function GET() {
  try {
    await initializeDatabase();
    const accounts = await getAccounts();
    return NextResponse.json(accounts);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/accounts
export async function POST(request) {
  try {
    await initializeDatabase();
    const data = await request.json();
    const { account, type } = data;

    if (!account || !type) {
      return NextResponse.json({ error: 'Nama dan tipe akun wajib diisi' }, { status: 400 });
    }

    await addAccount(account.trim(), type);
    return NextResponse.json({ message: `Akun '${account}' berhasil ditambahkan!` }, { status: 201 });
  } catch (error) {
    if (error.message.includes('duplicate') || error.message.includes('unique')) {
      return NextResponse.json({ error: `Akun sudah terdaftar!` }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
