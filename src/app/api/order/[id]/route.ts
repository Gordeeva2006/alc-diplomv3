import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "ID заявки не указан" }, { status: 400 });
    }

    // Получаем сессию пользователя
    const session = await getServerSession(authOptions);
    if (!session?.user?.client?.id) {
      return NextResponse.json({ error: "Пожалуйста авторизируйстель" }, { status: 401 });
    }

    const currentClientId = session.user.client.id;

    // Получаем заявка и client_id
    const [orderRows]: any = await pool.query(
      `SELECT o.id, o.total_amount, o.status, o.created_at, c.id AS client_id, c.legal_address 
       FROM orders o
       LEFT JOIN clients c ON o.client_id = c.id
       WHERE o.id = ?`,
      [id]
    );

    if (orderRows.length === 0) {
      return NextResponse.json({ error: "Заявка не найден" }, { status: 404 });
    }

    const order = orderRows[0];

    // Проверяем, принадлежит ли заявка текущему пользователю
    if (order.client_id !== currentClientId) {
      return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
    }

    // Получаем Продукцию
    const [items]: any = await pool.query(
      `SELECT oi.*, p.name AS product_name, pt.name AS packaging_name 
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN packaging_types pt ON oi.packaging_type_id = pt.id
       WHERE oi.order_id = ?`,
      [id]
    );

    return NextResponse.json({ order, items }, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения заявки:", error);
    return NextResponse.json({ error: "Не удалось загрузить данные" }, { status: 500 });
  }
}