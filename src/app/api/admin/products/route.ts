import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { pool } from "@/lib/db";


export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const dataType = url.searchParams.get('data');
    if (!dataType) {
      console.error('Ошибка: Не указан тип данных');
      return NextResponse.json(
        { error: 'Не указан тип данных' },
        { status: 400 }
      );
    }

    switch (dataType) {
      case 'products': {
        const [products] = await pool.query<RowDataPacket[]>(
          `SELECT p.id, p.name, p.description, p.price_per_gram, 
                 p.category, p.form_type, p.is_active,
                 GROUP_CONCAT(pt.id) as packaging_ids,
                 GROUP_CONCAT(pt.name) as packaging_names
          FROM products p
          LEFT JOIN product_packaging pp ON p.id = pp.product_id
          LEFT JOIN packaging_types pt ON pp.packaging_type_id = pt.id
          GROUP BY p.id`
        );
        return NextResponse.json(products, { status: 200 });
      }
      case 'packagings': {
        const [packagings] = await pool.query<RowDataPacket[]>(
          `SELECT id, name, form_type FROM packaging_types`
        );
        return NextResponse.json(packagings, { status: 200 });
      }
      case 'categories': {
        const [categories] = await pool.query<RowDataPacket[]>(
          `SELECT id, name FROM categorys`
        );
        return NextResponse.json(categories, { status: 200 });
      }
      case 'form_types': {
        const [formTypes] = await pool.query<RowDataPacket[]>(
          `SELECT id, name FROM form_types`
        );
        return NextResponse.json(formTypes, { status: 200 });
      }
      default: {
        console.error(`Ошибка: Неизвестный тип данных "${dataType}"`);
        return NextResponse.json(
          { error: 'Неизвестный тип данных' },
          { status: 400 }
        );
      }
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
    const { name, description, price_per_gram, category, form_type, is_active, packaging } = data;

    if (!name || !price_per_gram || !category) {
      console.error('Ошибка: Необходимые поля отсутствуют');
      return NextResponse.json(
        { error: 'Необходимые поля отсутствуют' },
        { status: 400 }
      );
    }

    const [productResult] = await pool.query(
      `INSERT INTO products 
       (name, description, price_per_gram, category, form_type, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price_per_gram, category, form_type, is_active]
    );

    const productId = (productResult as any).insertId;

    if (packaging && packaging.length > 0) {
      const values = packaging.map((pid: number) => [productId, pid]);
      await pool.query(
        `INSERT INTO product_packaging (product_id, packaging_type_id) VALUES ?`,
        [values]
      );
    }

    return NextResponse.json({ id: productId, success: true }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания продукта:', error);
    return NextResponse.json(
      { error: 'Ошибка создания продукта' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = parseInt(url.searchParams.get('id') || '0');

    if (!productId) {
      console.error('Ошибка: Не указан ID продукта');
      return NextResponse.json(
        { error: 'Не указан ID продукта' },
        { status: 400 }
      );
    }

    const data = await request.json();
    const { 
      name, 
      description, 
      price_per_gram, 
      category, 
      form_type, 
      is_active, 
      packaging 
    } = data;

    if (!name || !price_per_gram || !category) {
      console.error('Ошибка: Необходимые поля отсутствуют');
      return NextResponse.json(
        { error: 'Необходимые поля отсутствуют' },
        { status: 400 }
      );
    }

    await pool.query(
      `UPDATE products SET 
        name = ?, 
        description = ?, 
        price_per_gram = ?, 
        category = ?, 
        form_type = ?, 
        is_active = ?
      WHERE id = ?`,
      [name, description, price_per_gram, category, form_type, is_active, productId]
    );

    await pool.query(`DELETE FROM product_packaging WHERE product_id = ?`, [productId]);

    if (packaging && packaging.length > 0) {
      const values = packaging.map((pid: number) => [productId, pid]);
      await pool.query(
        `INSERT INTO product_packaging (product_id, packaging_type_id) VALUES ?`,
        [values]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления продукта:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления продукта' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = parseInt(url.searchParams.get('id') || '0');

    if (!productId) {
      console.error('Ошибка: Не указан ID продукта');
      return NextResponse.json(
        { error: 'Не указан ID продукта' },
        { status: 400 }
      );
    }

    const [orderCheck] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM order_items WHERE product_id = ?`, 
      [productId]
    );

    if ((orderCheck as any)[0].count > 0) {
      console.error('Ошибка: Нельзя удалить продукт, который используется в заказах');
      return NextResponse.json(
        { error: 'Нельзя удалить продукт, который используется в заказах' }, 
        { status: 400 }
      );
    }

    await pool.query(`DELETE FROM product_packaging WHERE product_id = ?`, [productId]);
    await pool.query(`DELETE FROM products WHERE id = ?`, [productId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления продукта:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления продукта' }, 
      { status: 500 }
    );
  }
}