import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

interface CartItem {
  productId: number;
  packagingId: number | null;
  quantity: number;
}

interface CartData {
  items: CartItem[];
}

const MIN_ORDER_AMOUNT = parseFloat(process.env.MIN_ORDER_AMOUNT || "800000");

function getCartFromCookie(req: NextRequest): CartData {
  const cartCookie = req.cookies.get("cart")?.value;
  if (!cartCookie) return { items: [] };

  try {
    const parsed = JSON.parse(decodeURIComponent(cartCookie));
    if (!parsed || !Array.isArray(parsed.items)) return { items: [] };

    const validItems = parsed.items
      .filter((item: any): item is CartItem =>
        typeof item.productId === "number" &&
        (item.packagingId === null || typeof item.packagingId === "number") &&
        typeof item.quantity === "number" &&
        item.quantity > 0
      )
      .filter((item: CartItem) => item.productId > 0 && item.quantity > 0);

    return { items: validItems };
  } catch (e) {
    console.warn("❌ Ошибка разбора корзины:", e);
    return { items: [] };
  }
}

function clearCartCookie(res: NextResponse) {
  res.cookies.set("cart", "", {
    httpOnly: true,
    maxAge: -1,
    path: "/",
  });
}

export async function POST(req: NextRequest) {
  let orderId: number | null = null;
  let connection = null;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Неавторизован" }, { status: 401 });
    }

    const userId = parseInt(session.user.id, 10);
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Неверный ID пользователя" }, { status: 400 });
    }

    const [clientRows]: any = await connection.query(
      `SELECT id FROM clients WHERE user_id = ?`,
      [userId]
    );

    if (!Array.isArray(clientRows) || clientRows.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "Клиент не найден" }, { status: 404 });
    }

    const clientId = clientRows[0].id;
    const cart = getCartFromCookie(req);

    if (cart.items.length === 0) {
      await connection.rollback();
      return NextResponse.json({ error: "Корзина пуста" }, { status: 400 });
    }

    let totalAmount = 0;
    const now = new Date().toISOString().slice(0, 19).replace("T", " ");

    const [orderResult] = await connection.query(
      `INSERT INTO orders (client_id, status, created_at) VALUES (?, ?, ?)`,
      [clientId, 1, now]
    );

    orderId = (orderResult as any).insertId;

    for (const item of cart.items) {
      const { productId, packagingId, quantity } = item;

      const [productRows]: any = await connection.query(
        `SELECT price_per_gram, is_active FROM products WHERE id = ?`,
        [productId]
      );

      if (!productRows || productRows.length === 0 || !productRows[0].is_active) {
        await connection.rollback();
        return NextResponse.json(
          { error: `Продукт ${productId} не найден или недоступен` },
          { status: 400 }
        );
      }

      let packagingVolume = 1;
      if (packagingId !== null) {
        const [packagingRows]: any = await connection.query(
          `SELECT volume FROM packaging_types WHERE id = ?`,
          [packagingId]
        );

        if (!packagingRows || packagingRows.length === 0) {
          await connection.rollback();
          return NextResponse.json(
            { error: `Упаковка ${packagingId} не найдена` },
            { status: 400 }
          );
        }

        packagingVolume = packagingRows[0].volume;
      }

      const unitPrice = parseFloat((productRows[0].price_per_gram * packagingVolume).toFixed(2));
      const batchVolume = Math.floor(quantity * packagingVolume);

      await connection.query(
        `INSERT INTO order_items 
          (order_id, product_id, packaging_type_id, quantity, unit_price, batch_volume) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, productId, packagingId, quantity, unitPrice, batchVolume]
      );

      totalAmount += unitPrice * quantity;
    }

    if (totalAmount < MIN_ORDER_AMOUNT) {
      await connection.rollback();
      return NextResponse.json(
        { error: `Минимальная сумма заказа ${MIN_ORDER_AMOUNT.toLocaleString()} ₽` },
        { status: 400 }
      );
    }

    await connection.query(
      `UPDATE orders SET status = 1, total_amount = ? WHERE id = ?`,
      [totalAmount, orderId]
    );

    await connection.commit();

    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/orders`,
      302
    );

    clearCartCookie(response);

    return response;

  } catch (error: any) {
    console.error("❌ Ошибка оформления заказа:", error.sqlMessage || error);

    if (connection) {
      await connection.rollback();
      await connection.release();
    }

    if (orderId) {
      try {
        await pool.query(`DELETE FROM order_items WHERE order_id = ?`, [orderId]);
        await pool.query(`DELETE FROM orders WHERE id = ?`, [orderId]);
      } catch (deleteError) {
        console.error("Ошибка удаления заказа:", deleteError);
      }
    }

    return NextResponse.json(
      { error: "Не удалось оформить заказ" },
      { status: 500 }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}