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
    
    // Получаем clientId и тип клиента
    const [clientRows]: any = await pool.query(
      `SELECT id, type FROM clients WHERE user_id = ?`,
      [userId]
    );
    
    if (clientRows.length === 0) {
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    }
    
    const clientId = clientRows[0].id;
    const clientType = clientRows[0].type;

    // SQL-запрос с расширенными данными и статусами
    const [rows]: any = await pool.query(`
      SELECT 
        o.id AS order_id,
        o.total_amount,
        s.name AS status_name,
        o.created_at,
        o.contract_file,
        o.certificate_file,
        c.legal_address,
        c.type AS client_type,
        u.email AS client_email,
        u.phone AS client_phone,
        le.company_name AS legal_company,
        le.inn AS legal_inn,
        le.kpp AS legal_kpp,
        i.company_name AS individual_company,
        i.inn AS individual_inn,
        i.ogrnip AS individual_ogrnip,
        oi.id AS item_id,
        oi.product_id,
        oi.packaging_type_id,
        oi.quantity,
        oi.unit_price,
        oi.batch_volume,
        p.name AS product_name,
        p.price_per_gram,
        pt.name AS packaging_name,
        pt.volume AS packaging_volume,
        pt.image AS packaging_image
      FROM orders o
      LEFT JOIN clients c ON o.client_id = c.id
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN legal_entities le ON c.id = le.client_id
      LEFT JOIN individuals i ON c.id = i.client_id
      LEFT JOIN statuses s ON o.status = s.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN packaging_types pt ON oi.packaging_type_id = pt.id
      WHERE o.client_id = ?
      ORDER BY o.created_at DESC`, [clientId]);

    // Группировка товаров по заказам
    const ordersMap = new Map<number, any>();
    
    for (const row of rows) {
      const orderId = row.order_id;
      
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          id: orderId,
          total_amount: Number(row.total_amount),
          status_name: row.status_name,
          created_at: row.created_at,
          legal_address: row.legal_address,
          contract_file: row.contract_file,
          certificate_file: row.certificate_file,
          client_type: row.client_type,
          client_email: row.client_email,
          client_phone: row.client_phone,
          legal_company: row.legal_company,
          legal_inn: row.legal_inn,
          legal_kpp: row.legal_kpp,
          individual_company: row.individual_company,
          individual_inn: row.individual_inn,
          individual_ogrnip: row.individual_ogrnip,
          items: [],
        });
      }
      
      const order = ordersMap.get(orderId)!;
      const pricePerGram = Number(row.price_per_gram);
      const packagingVolume = Number(row.packaging_volume);
      const quantity = row.quantity;
      const totalPricePerPackage = pricePerGram * packagingVolume * quantity;
      
      // Добавляем товар
      order.items.push({
        product_id: row.product_id,
        product_name: row.product_name,
        packaging_type_id: row.packaging_type_id,
        packaging_name: row.packaging_name,
        packaging_image: row.packaging_image,
        quantity: row.quantity,
        unit_price: Number(row.unit_price),
        batch_volume: row.batch_volume,
        price_per_gram: pricePerGram,
        packaging_volume: packagingVolume,
        totalPricePerPackage: totalPricePerPackage
      });
    }
    
    const orders = Array.from(ordersMap.values());
    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения списка заказов:", error);
    return NextResponse.json({ error: "Не удалось получить список заказов" }, { status: 500 });
  }
}