import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

// Типизация для результата запроса
interface UserRow {
  password_hash: string;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Неавторизован" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const userId = parseInt(session.user.id);
    if (isNaN(userId)) {
      return new Response(JSON.stringify({ error: "Неверный ID пользователя" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { oldPassword, newPassword } = await req.json();

    // Валидация данных
    if (!oldPassword || !newPassword) {
      return new Response(JSON.stringify({ error: "Все поля обязательны" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (newPassword.length < 8) {
      return new Response(JSON.stringify({ error: "Пароль должен быть не менее 8 символов" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (newPassword.length > 32) {
      return new Response(JSON.stringify({ error: "Пароль не должен превышать 32 символа" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Получение текущего хэша пароля
    const [queryResult] = await pool.query<any[]>(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );

    // Проверка, что результат - массив
    if (!Array.isArray(queryResult)) {
      console.error("Неверный формат ответа от БД");
      return new Response(JSON.stringify({ error: "Ошибка сервера" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (queryResult.length === 0) {
      return new Response(JSON.stringify({ error: "Пользователь не найден" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const currentUser = queryResult[0] as UserRow;
    if (!currentUser.password_hash) {
      console.error("Пароль не найден для пользователя ID:", userId);
      return new Response(JSON.stringify({ error: "Ошибка сервера" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Проверка старого пароля
    const isValid = await bcrypt.compare(oldPassword, currentUser.password_hash);
    if (!isValid) {
      return new Response(JSON.stringify({ error: "Неверный старый пароль" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Хэширование нового пароля
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    // Обновление пароля
    await pool.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [hash, userId]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Ошибка изменения пароля:", error);
    return new Response(JSON.stringify({ error: "Ошибка сервера" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}