import { NextResponse } from 'next/server';

/**
 * Helper response JSON sukses
 */
export function successResponse(data, status = 200) {
  return NextResponse.json(data, { status });
}

/**
 * Helper response JSON error
 */
export function errorResponse(message, status = 500) {
  return NextResponse.json({ error: message }, { status });
}
