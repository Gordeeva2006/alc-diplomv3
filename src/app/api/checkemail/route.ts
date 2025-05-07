import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email не указан' },
        { status: 400 }
      )
    }

    const [rows]: any = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      return NextResponse.json(
        { exists: false },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { exists: true },
      { status: 200 }
    )
  } catch (error) {
    console.error('Ошибка проверки email:', error)
    return NextResponse.json(
      { error: 'Ошибка проверки email' },
      { status: 500 }
    )
  }
}