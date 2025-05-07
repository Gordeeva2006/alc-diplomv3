import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { pool } from "@/lib/db";
/**
 * POST /api/questions — Обработка формы контактов
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Извлечение данных из тела запроса
    const { name, question, phone, agreement } = body;

    // Валидация обязательных полей
    if (!name || !question || !phone || !agreement) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      );
    }

    // Валидация номера телефона (простая проверка формата)
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Неверный формат номера телефона' },
        { status: 400 }
      );
    }

    // Сохраняем данные в базу MySQL
    const [result] = await pool.query(
      'INSERT INTO questions (name, question, phone) VALUES (?, ?, ?)',
      [name, question, phone]
    );

    // Получаем ID вставленной записи
    const insertId = (result as mysql.ResultSetHeader).insertId;

    // Возвращаем успешный ответ
    return NextResponse.json({
      message: 'Ваш вопрос успешно отправлен!',
      questionId: insertId,
    });
  } catch (error) {
    console.error('Ошибка при обработке запроса:', error);
    return NextResponse.json(
      { error: 'Произошла ошибка при обработке вашего запроса' },
      { status: 500 }
    );
  }
}