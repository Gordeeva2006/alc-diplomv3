import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { pool } from "@/lib/db";

// --- Типы ---
export interface CartItem {
  productId: number;
  packagingId: number | null;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}



// --- Хелперы ---
function getCartFromCookie(req: NextRequest): CartState {
  const cartCookie = req.cookies.get('cart')?.value;
  if (!cartCookie) return { items: [] };
  try {
    const parsed = JSON.parse(cartCookie);
    if (Array.isArray(parsed)) return { items: parsed };
    if (parsed && Array.isArray(parsed.items)) return parsed as CartState;
  } catch (e) {
    console.warn('Corrupted cart cookie:', e);
  }
  return { items: [] };
}

function setCartCookie(res: NextResponse, cart: CartState) {
  res.cookies.set('cart', JSON.stringify(cart), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
}

async function updateCart(
  req: NextRequest,
  updater: (cart: CartState) => void
): Promise<NextResponse> {
  const cart = getCartFromCookie(req);
  updater(cart);
  const res = NextResponse.json({ success: true });
  setCartCookie(res, cart);
  return res;
}

// --- GET: Получение содержимого корзины с данными из БД ---
export async function GET(req: NextRequest) {
  try {
    const cart = getCartFromCookie(req);
    if (cart.items.length === 0) return NextResponse.json([], { status: 200 });

    const productIds = [...new Set(cart.items.map(item => item.productId))];
    const [rows] = await pool.query(
      `SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.description AS product_description,
        p.price_per_gram,
        pt.id AS packaging_id,
        pt.name AS packaging_name,
        pt.volume AS packaging_volume,
        pt.unit AS packaging_unit
      FROM products p
      LEFT JOIN product_packaging pp ON p.id = pp.product_id
      LEFT JOIN packaging_types pt ON pp.packaging_type_id = pt.id
      WHERE p.id IN (?)`,
      [productIds]
    );

    const enrichedItems = cart.items.map((item) => {
      const matchingRow = rows.find(
        (row: any) =>
          row.product_id === item.productId &&
          ((row.packaging_id === null && item.packagingId === null) ||
           (row.packaging_id !== null && item.packagingId !== null && row.packaging_id === item.packagingId))
      );

      // Расчёт unit_price: price_per_gram * объём упаковки (в граммах)
      let volumeInGrams = 0;
      if (matchingRow) {
        if (matchingRow.packaging_volume !== null) {
          if (matchingRow.packaging_unit === 'kg') {
            volumeInGrams = matchingRow.packaging_volume * 1000; // Конвертация кг → г
          } else {
            volumeInGrams = matchingRow.packaging_volume; // Предполагается, что volume в граммах
          }
        } else {
          volumeInGrams = 1; // Если объём не указан, считаем 1 грамм (price_per_gram = цена за грамм)
        }
      }

      return {
        order_item_id: `${item.productId}-${item.packagingId ?? 'none'}`,
        product_id: item.productId,
        product_name: matchingRow?.product_name || `Неизвестный продукт (${item.productId})`,
        packaging_type_id: item.packagingId ?? null,
        packaging_name: matchingRow?.packaging_name || null,
        volume: matchingRow?.packaging_volume || null,
        unit: matchingRow?.packaging_unit || null,
        quantity: item.quantity,
        unit_price: matchingRow 
          ? parseFloat(matchingRow.price_per_gram) * volumeInGrams 
          : 0,
      };
    });

    return NextResponse.json(enrichedItems, { status: 200 });
  } catch (error) {
    console.error('Ошибка при получении корзины:', error);
    return NextResponse.json({ error: 'Не удалось загрузить корзину' }, { status: 500 });
  }
}

// --- POST: Добавление товара в корзину ---
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, packagingId, quantity } = body;

    if (
      !Number.isInteger(productId) || productId <= 0 ||
      (packagingId !== undefined && packagingId !== null && !Number.isInteger(packagingId)) ||
      !Number.isInteger(quantity) || quantity < 200
    ) {
      return NextResponse.json({ error: 'Неверные параметры' }, { status: 400 });
    }

    // Проверка существования продукта
    const [productRows] = await pool.query(
      'SELECT id FROM products WHERE id = ?', 
      [productId]
    );
    if ((productRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Продукт не найден' }, { status: 404 });
    }

    // Проверка доступности упаковки
    if (packagingId !== undefined) {
      let query: string;
      let params: any[];
      if (packagingId === null) {
        query = `
          SELECT 1 
          FROM product_packaging 
          WHERE product_id = ? AND packaging_type_id IS NULL
        `;
        params = [productId];
      } else {
        query = `
          SELECT 1 
          FROM product_packaging 
          WHERE product_id = ? AND packaging_type_id = ?
        `;
        params = [productId, packagingId];
      }
      const [packagingRows] = await pool.query(query, params);
      if ((packagingRows as any[]).length === 0) {
        return NextResponse.json(
          { error: 'Упаковка не доступна для этого продукта' },
          { status: 404 }
        );
      }
    }

    return updateCart(req, (cart) => {
      const existingItemIndex = cart.items.findIndex(
        item =>
          item.productId === productId &&
          ((item.packagingId === null && packagingId === null) ||
           (item.packagingId !== null && packagingId !== null && item.packagingId === packagingId))
      );
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({
          productId,
          packagingId: packagingId ?? null,
          quantity,
        });
      }
    });
  } catch (error) {
    console.error('Ошибка при добавлении товара:', error);
    return NextResponse.json({ error: 'Не удалось добавить товар' }, { status: 500 });
  }
}

// --- PUT: Обновление количества товара ---
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, packagingId, quantity } = body;

    if (
      !Number.isInteger(productId) || productId <= 0 ||
      !Number.isInteger(quantity) || quantity < 200
    ) {
      return NextResponse.json({ error: 'Неверные параметры' }, { status: 400 });
    }

    return updateCart(req, (cart) => {
      const itemIndex = cart.items.findIndex(
        item =>
          item.productId === productId &&
          ((item.packagingId === null && packagingId === null) ||
           (item.packagingId !== null && packagingId !== null && item.packagingId === packagingId))
      );
      if (itemIndex === -1) {
        throw new Error('Товар не найден в корзине');
      }
      cart.items[itemIndex].quantity = quantity;
    });
  } catch (error) {
    console.error('Ошибка при обновлении количества:', error);
    return NextResponse.json({ error: 'Не удалось обновить количество' }, { status: 500 });
  }
}

// --- DELETE: Удаление товара из корзины ---
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId, packagingId } = body;

    if (!Number.isInteger(productId) || productId <= 0) {
      return NextResponse.json({ error: 'Неверные параметры' }, { status: 400 });
    }

    return updateCart(req, (cart) => {
      cart.items = cart.items.filter(
        item =>
          !(item.productId === productId &&
            ((item.packagingId === null && packagingId === null) ||
             (item.packagingId !== null && packagingId !== null && item.packagingId === packagingId)))
      );
    });
  } catch (error) {
    console.error('Ошибка при удалении товара:', error);
    return NextResponse.json({ error: 'Не удалось удалить товар' }, { status: 500 });
  }
}