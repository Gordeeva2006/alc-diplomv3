import { NextRequest, NextResponse } from 'next/server'
import { pool } from '@/lib/db'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

// Генерация пароля по требованиям безопасности
const generatePassword = (): string => {
  const lower = 'abcdefghijklmnopqrstuvwxyz'
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const digits = '0123456789'
  const symbols = '@$!%*?&'

  const getRandomChar = (chars: string): string => 
    chars[Math.floor(Math.random() * chars.length)]

  let password = [
    getRandomChar(lower),
    getRandomChar(upper),
    getRandomChar(digits),
    getRandomChar(symbols)
  ]

  const allChars = lower + upper + digits + symbols
  while (password.length < 9) {
    password.push(getRandomChar(allChars))
  }

  return password.sort(() => 0.5 - Math.random()).join('')
}

// Отправка письма через SMTP Яндекса
const sendResetPasswordEmail = async (email: string, newPassword: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: process.env.YANDEX_EMAIL,
      pass: process.env.YANDEX_PASSWORD
    }
  })

  const mailOptions = {
    from: `"Поддержка сайта" <${process.env.YANDEX_EMAIL}>`,
    to: email,
    subject: 'Восстановление пароля',
    html: `
      <h2>Восстановление пароля</h2>
      <p>Ваш пароль был сброшен. Новый пароль:</p>
      <h3 style="color: #2563eb; margin: 1rem 0;">${newPassword}</h3>
      <p>Пожалуйста, войдите в систему с новым паролем и измените его в настройках профиля.</p>
    `
  }

  await transporter.sendMail(mailOptions)
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    // Проверка наличия пользователя
    const [rows]: any = await pool.query(
      'SELECT id, email FROM users WHERE email = ?',
      [email]
    )

    if (rows.length === 0) {
      // Для безопасности возвращаем 200 даже если пользователь не найден
      return NextResponse.json({ success: true })
    }

    const newPassword = generatePassword()
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Обновление пароля в базе данных
    await pool.query(
      'UPDATE users SET password_hash = ? WHERE email = ?',
      [hashedPassword, email]
    )

    // Отправка email с новым паролем
    await sendResetPasswordEmail(email, newPassword)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Ошибка восстановления пароля:', error)
    return NextResponse.json(
      { error: 'Ошибка восстановления пароля' },
      { status: 500 }
    )
  }
}