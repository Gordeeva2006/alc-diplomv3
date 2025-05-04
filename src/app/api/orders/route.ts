import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
    }
    const userId = parseInt(session.user.id);

    // Получаем clientId
    const [clientRows]: any = await pool.query(
      `SELECT id FROM clients WHERE user_id = ?`,
      [userId]
    );
    if (clientRows.length === 0) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    }
    const clientId = clientRows[0].id;

    // SQL-запрос
    const [rows]: any = await pool.query(`
      SELECT 
        o.id AS order_id,
        o.total_amount,
        o.status,
        o.created_at,
        o.contract_file,
        o.certificate_file,
        c.legal_address,
        oi.id AS item_id,
        oi.product_id,
        oi.packaging_type_id,
        oi.quantity,
        oi.unit_price,
        oi.batch_volume,
        p.name AS product_name,
        pt.name AS packaging_name
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN packaging_types pt ON oi.packaging_type_id = pt.id
      WHERE o.client_id = ?
      ORDER BY o.created_at DESC`, [clientId]);

    // Группировка товаров по заказам
    const ordersMap = new Map<number, Order>();
    for (const row of rows) {
      const orderId = row.order_id;
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: orderId,
          total_amount: Number(row.total_amount),
          status: row.status,
          created_at: row.created_at,
          legal_address: row.legal_address,
          contract_file: row.contract_file,
          certificate_file: row.certificate_file,
          items: [],
        });
      }
      const order = ordersMap.get(orderId)!;

      // Добавляем товар
      order.items.push({
        product_id: row.product_id,
        product_name: row.product_name,
        packaging_type_id: row.packaging_type_id,
        packaging_name: row.packaging_name,
        quantity: row.quantity,
        unit_price: Number(row.unit_price),
        batch_volume: row.batch_volume,
      });
    }

    const orders = Array.from(ordersMap.values());
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения списка заказов:", error);
    return NextResponse.json({ error: "Не удалось получить список заказов" }, { status: 500 });
  }
}