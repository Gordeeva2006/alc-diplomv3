import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import { pool } from "@/lib/db";
import { ResultSetHeader } from 'mysql2';

// Типизация данных из БД
interface RowDataPacket extends mysql.RowDataPacket {
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
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: {
        user: process.env.YANDEX_EMAIL,
        pass: process.env.YANDEX_PASSWORD
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
  } catch (error) {
    console.error('Ошибка отправки email:', error);
    throw error;
  }
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
        const userId = parseInt(request.headers.get('x-user-id') || '0');
        if (!userId) {
          return NextResponse.json(
            { error: 'Не указан ID текущего пользователя' },
            { status: 400 }
          );
        }
        
        const [userRows] = await pool.query<RowDataPacket[]>(
          `SELECT id, role FROM users WHERE id = ?`,
          [userId]
        );
        
        if (userRows.length === 0) {
          return NextResponse.json(
            { error: 'Пользователь не найден' },
            { status: 404 }
          );
        }
        
        const [roleRows] = await pool.query<RowDataPacket[]>(
          `SELECT name FROM roles WHERE id = ?`,
          [userRows[0].role]
        );
        
        return NextResponse.json({
          id: userRows[0].id,
          role: userRows[0].role,
          role_name: roleRows[0]?.name || 'Неизвестная роль'
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
    const currentUserId = parseInt(request.headers.get('x-user-id') || '0');
    
    if (!currentUserId) {
      return NextResponse.json(
        { error: 'Не указан ID текущего пользователя' },
        { status: 400 }
      );
    }
    
    const [currentUserRows] = await pool.query<RowDataPacket[]>(
      `SELECT role FROM users WHERE id = ?`,
      [currentUserId]
    );
    
    if (currentUserRows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    const currentRoleId = currentUserRows[0].role;
    
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
    
    // Проверка существования email
    const [existingEmailRows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM users WHERE email = ?`,
      [email]
    );
    
    if (existingEmailRows.length > 0) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }
    
    // Генерация пароля и хэширование
    const password = generatePassword();
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    // Отправка письма с паролем
    try {
      await sendRegistrationEmail(email, password);
    } catch (emailError) {
      console.error('Ошибка отправки email при регистрации:', emailError);
      return NextResponse.json(
        { error: 'Не удалось отправить email регистрации' },
        { status: 500 }
      );
    }
    
    // Создание пользователя
    const [userResult] = await pool.query<ResultSetHeader>(
      `INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)`,
      [email, passwordHash, role]
    );
    
    return NextResponse.json({ 
      id: userResult.insertId,
      success: true,
      message: 'Пользователь создан. Пароль отправлен на email.'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Ошибка создания пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка создания пользователя', details: error.message },
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
    const currentUserId = parseInt(request.headers.get('x-user-id') || '0');
    
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
    
    const [targetUserRows] = await pool.query<RowDataPacket[]>(
      `SELECT role FROM users WHERE id = ?`,
      [userId]
    );
    
    if (targetUserRows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    const targetRoleId = targetUserRows[0].role;
    const [currentUserRows] = await pool.query<RowDataPacket[]>(
      `SELECT role FROM users WHERE id = ?`,
      [currentUserId]
    );
    
    if (currentUserRows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    const currentRoleId = currentUserRows[0].role;
    
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
    
    // Проверка уникальности email
    const [existingEmailRows] = await pool.query<RowDataPacket[]>(
      `SELECT id FROM users WHERE email = ? AND id != ?`,
      [email, userId]
    );
    
    if (existingEmailRows.length > 0) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }
    
    // Обновление пользователя
    await pool.query(
      `UPDATE users SET 
        email = ?, 
        role = ?
      WHERE id = ?`,
      [email, role, userId]
    );
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ошибка обновления пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления пользователя', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const userId = parseInt(url.searchParams.get('id') || '0');
    const currentUserId = parseInt(request.headers.get('x-user-id') || '0');
    
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
    
    const [targetUserRows] = await pool.query<RowDataPacket[]>(
      `SELECT role FROM users WHERE id = ?`,
      [userId]
    );
    
    if (targetUserRows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    const targetRoleId = targetUserRows[0].role;
    const [currentUserRows] = await pool.query<RowDataPacket[]>(
      `SELECT role FROM users WHERE id = ?`,
      [currentUserId]
    );
    
    if (currentUserRows.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }
    
    const currentRoleId = currentUserRows[0].role;
    
    // Проверка прав
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
    
    // Удаление пользователя
    await pool.query(`DELETE FROM users WHERE id = ?`, [userId]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ошибка удаления пользователя:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления пользователя', details: error.message },
      { status: 500 }
    );
  }
}