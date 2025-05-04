// src/app/api/admin/statuses/route.ts
import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT id, name FROM statuses');
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка загрузки статусов' }, { status: 500 });
  }
}