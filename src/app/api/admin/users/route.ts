import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs'; // Используем bcrypt для хэширования
import nodemailer from 'nodemailer';
import { pool } from "@/lib/db";

// Типизация данных из БД
interface RowDataPacket {
  id?: number;
  email?: string;
  role?: number;
  name?: string;
  created_at?: Date;
}



// Генерация пароля по регулярному выражению
const generatePassword = (): string => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const symbols = '@$!%*?&';

  const getRandomChar = (chars: string): string => 
    chars[Math.floor(Math.random() * chars.length)];

  let password = [
    getRandomChar(lower),
    getRandomChar(upper),
    getRandomChar(digits),
    getRandomChar(symbols)
  ];

  const allChars = lower + upper + digits + symbols;
  while (password.length < 9) {
    password.push(getRandomChar(allChars));
  }

  return password.sort(() => 0.5 - Math.random()).join('');
};

// Отправка письма через SMTP Яндекса
const sendRegistrationEmail = async (email: string, password: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465, // Используем SSL/TLS
    secure: true,
    auth: {
      user: process.env.YANDEX_EMAIL, // Email от Яндекса
      pass: process.env.YANDEX_PASSWORD // Пароль от Яндекса
    }
  });

  const mailOptions = {
    from: `"Регистрация" <${process.env.YANDEX_EMAIL}>`,
    to: email,
    subject: 'Регистрация на платформе',
    html: `
      <h2>Добро пожаловать!</h2>
      <p>Вы были зарегистрированы на платформе. Ваши данные:</p>
      <ul>
        <li>Email: ${email}</li>
        <li>Пароль: ${password}</li>
      </ul>
      <p>Сохраните пароль в надежном месте.</p>
    `
  };

  await transporter.sendMail(mailOptions);
};

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const dataType = url.searchParams.get('data');

    if (!dataType) {
      return NextResponse.json(
        { error: 'Не указан тип данных' },
        { status: 400 }
      );
    }

    switch (dataType) {
      case 'users': {
        const [users] = await pool.query<RowDataPacket[]>(
          `SELECT u.id, u.email, u.role, r.name as role_name, u.created_at
           FROM users u
           JOIN roles r ON u.role = r.id`
        );
        return NextResponse.json(users, { status: 200 });
      }

      case 'roles': {
        const [roles] = await pool.query<RowDataPacket[]>(
          `SELECT id, name FROM roles`
        );
        return NextResponse.json(roles, { status: 200 });
      }

      case 'current': {
        const userId = parseInt((request.headers.get('x-user-id') || '0'));
        if (!userId) {
          return NextResponse.json(
            { error: 'Не указан ID текущего пользователя' },
            { status: 400 }
          );
        }

        const [user] = await pool.query<RowDataPacket[]>(
          `SELECT id, role FROM users WHERE id = ?`,
          [userId]
        );

        if ((user[0] as any).length === 0) {
          return NextResponse.json(
            { error: 'Пользователь не найден' },
            { status: 404 }
          );
        }

        const currentRoleId = (user[0] as any).role;
        const [role] = await pool.query<RowDataPacket[]>(
          `SELECT name FROM roles WHERE id = ?`,
          [currentRoleId]
        );

        return NextResponse.json({
          id: (user[0] as any).id,
          role: currentRoleId,
          role_name: (role[0] as any).name
        }, { status: 200 });
      }

      default:
        return NextResponse.json(
          { error: 'Неизвестный тип данных' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Ошибка загрузки данных:', error);
    return NextResponse.json(
      { error: 'Ошибка загрузки данных' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { email } = data;
    const role = data.role || 4; // По умолчанию менеджер

    const userId = parseInt((request.headers.get('x-user-id') || '0'));
    if (!userId) {
      return NextResponse.json(
        { error: 'Не указан ID текущего пользователя' },
        { status: 400 }
      );
    }

    const [currentUser] = await pool.query<RowDataPacket[]>(
      `SELECT role FROM users WHERE id = ?`,
      [userId]
    );

    if ((currentUser[0] as any).length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const currentRoleId = (currentUser[0] as any).role;

    // Проверка прав
    if (currentRoleId === 1) { // Director
      if (role === 1) {
        return NextResponse.json(
          { error: 'Нельзя создавать директора' },
          { status: 403 }
        );
      }
    } else if (currentRoleId === 2) { // Admin
      if (role === 1 || role === 2) {
        return NextResponse.json(
          { error: 'Нельзя создавать администратора или директора' },
          { status: 403 }
        );
      }
    } else if (currentRoleId === 3) { // Senior Manager
      if (role !== 4) {
        return NextResponse.json(
          { error: 'Можно создавать только менеджеров' },
          { status: 403 }
        );
      }
    }

    // Генерация пароля
    const password = generatePassword();

    // Хэширование пароля с bcrypt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Отправка письма с паролем
    await sendRegistrationEmail(email, password);

    const [userResult] = await pool.query(
      `INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
      [email, passwordHash, role]
    );

    return NextResponse.json({ 
      id: (userResult as any).insertId, 
      success: true,
      message: 'Пользователь создан. Пароль отправлен на email.'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Ошибка создания пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка создания пользователя' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = parseInt(url.searchParams.get('id') || '0');
    const data = await request.json();
    const { email, role } = data;

    const currentUserId = parseInt((request.headers.get('x-user-id') || '0'));
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Не указан ID текущего пользователя' },
        { status: 400 }
      );
    }

    if (userId === currentUserId) {
      return NextResponse.json(
        { error: 'Нельзя редактировать самого себя' },
        { status: 403 }
      );
    }

    const [targetUser] = await pool.query<RowDataPacket[]>(
      `SELECT role FROM users WHERE id = ?`,
      [userId]
    );

    if ((targetUser[0] as any).length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const targetRoleId = (targetUser[0] as any).role;
    const [currentUser] = await pool.query<RowDataPacket[]>(
      `SELECT role FROM users WHERE id = ?`,
      [currentUserId]
    );

    if ((currentUser[0] as any).length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const currentRoleId = (currentUser[0] as any).role;

    // Проверка прав
    if (currentRoleId === 1) { // Director
      if (targetRoleId === 1) {
        return NextResponse.json(
          { error: 'Нельзя редактировать директора' },
          { status: 403 }
        );
      }
    } else if (currentRoleId === 2) { // Admin
      if (targetRoleId === 1) {
        return NextResponse.json(
          { error: 'Нельзя редактировать директора' },
          { status: 403 }
        );
      }
    } else if (currentRoleId === 3) { // Senior Manager
      if (targetRoleId !== 4) {
        return NextResponse.json(
          { error: 'Можно редактировать только менеджеров' },
          { status: 403 }
        );
      }
    }

    await pool.query(
      `UPDATE users SET 
        email = ?, 
        role = ?
      WHERE id = ?`,
      [email, role, userId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления пользователя' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = parseInt(url.searchParams.get('id') || '0');
    const currentUserId = parseInt((request.headers.get('x-user-id') || '0'));

    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Не указан ID текущего пользователя' },
        { status: 400 }
      );
    }

    if (userId === currentUserId) {
      return NextResponse.json(
        { error: 'Нельзя удалить самого себя' },
        { status: 403 }
      );
    }

    const [targetUser] = await pool.query<RowDataPacket[]>(
      `SELECT role FROM users WHERE id = ?`,
      [userId]
    );

    if ((targetUser[0] as any).length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const targetRoleId = (targetUser[0] as any).role;
    const [currentUser] = await pool.query<RowDataPacket[]>(
      `SELECT role FROM users WHERE id = ?`,
      [currentUserId]
    );

    if ((currentUser[0] as any).length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    const currentRoleId = (currentUser[0] as any).role;

    if (currentRoleId === 1) { // Director
      if (targetRoleId === 1) {
        return NextResponse.json(
          { error: 'Нельзя удалить директора' },
          { status: 403 }
        );
      }
    } else if (currentRoleId === 2) { // Admin
      if (targetRoleId === 1 || targetRoleId === 2) {
        return NextResponse.json(
          { error: 'Нельзя удалить директора или администратора' },
          { status: 403 }
        );
      }
    } else if (currentRoleId === 3) { // Senior Manager
      if (targetRoleId !== 4) {
        return NextResponse.json(
          { error: 'Можно удалить только менеджера' },
          { status: 403 }
        );
      }
    }

    await pool.query(`DELETE FROM users WHERE id = ?`, [userId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления пользователя' },
      { status: 500 }
    );
  }
}