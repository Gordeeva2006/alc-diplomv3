import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      userType,
      companyName,
      inn,
      ogrn,
      ogrnip,
      kpp,
      legalAddress,
      email,
      password,
      phone
    } = await request.json();

    // Валидация
    if (!email || !password || !companyName || !inn || !legalAddress || !phone) {
      return NextResponse.json({ error: "Заполните все обязательные поля" }, { status: 400 });
    }

    if (password.length < 9) {
      return NextResponse.json({ error: "Пароль должен быть не менее 9 символов" }, { status: 400 });
    }

    // Проверка уникальности email
    const [existingUser] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if ((existingUser as any[]).length > 0) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 400 });
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Транзакция для регистрации
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Создание пользователя
      const [userResult] = await connection.query(
        "INSERT INTO users (email, phone, password_hash) VALUES (?, ?, ?)",
        [email, phone.replace(/\D/g, ""), hashedPassword]
      );

      const userId = (userResult as any).insertId;

      // 2. Создание клиента
      const [clientResult] = await connection.query(
        "INSERT INTO clients (user_id, type, phone, legal_address) VALUES (?, ?, ?, ?)",
        [userId, userType, phone.replace(/\D/g, ""), legalAddress]
      );

      const clientId = (clientResult as any).insertId;

      // 3. Создание юридического лица или ИП
      if (userType === "legal_entity") {
        await connection.query(
          "INSERT INTO legal_entities (client_id, company_name, inn, kpp, ogrn) VALUES (?, ?, ?, ?, ?)",
          [clientId, companyName, inn, kpp, ogrn]
        );
      } else {
        await connection.query(
          "INSERT INTO individuals (client_id, company_name, inn, ogrnip) VALUES (?, ?, ?, ?)",
          [clientId, companyName, inn, ogrnip]
        );
      }

      await connection.commit();
      return NextResponse.json({ message: "Регистрация успешна" }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      console.error("Registration error:", error);
      return NextResponse.json({ error: "Ошибка регистрации" }, { status: 500 });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Request error:", error);
    return NextResponse.json({ error: "Произошла ошибка" }, { status: 500 });
  }
}