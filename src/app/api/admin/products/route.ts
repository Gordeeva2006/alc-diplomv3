import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { pool } from '@/lib/db';

// Получение данных
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
      case 'products': {
        const [products] = await pool.query<mysql.RowDataPacket[]>(
          `SELECT p.id, p.name, p.description, p.price_per_gram, 
                   p.category, p.form_type, p.is_active,
                   GROUP_CONCAT(pt.id) as packaging_ids,
                   GROUP_CONCAT(pt.name) as packaging_names
            FROM products p
            LEFT JOIN product_packaging pp ON p.id = pp.product_id
            LEFT JOIN packaging_types pt ON pp.packaging_type_id = pt.id
            GROUP BY p.id`
        );
        return NextResponse.json(products);
      }
      
      case 'packagings': {
        const [rows] = await pool.query<mysql.RowDataPacket[]>(
          `SELECT pt.id, pt.name, pt.volume, pt.material, pt.unit, pt.image,
                   m.name AS material_name, u.name AS unit_name
            FROM packaging_types pt
            LEFT JOIN materials m ON pt.material = m.id
            LEFT JOIN units u ON pt.unit = u.id`
        );
        return NextResponse.json(rows);
      }
      
      case 'categories': {
        const [rows] = await pool.query<mysql.RowDataPacket[]>(
          `SELECT id, name FROM categorys ORDER BY name ASC`
        );
        return NextResponse.json(rows);
      }
      
      case 'form_types': {
        const [rows] = await pool.query<mysql.RowDataPacket[]>(
          `SELECT id, name FROM form_types ORDER BY name ASC`
        );
        return NextResponse.json(rows);
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

// Создание продукта
export async function POST(request: NextRequest) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const data = await request.json();
    const {
      name,
      description = '',
      price_per_gram,
      category,
      form_type = null,
      is_active = 1,
      packaging = []
    } = data;
    
    // Проверка обязательных полей
    if (!name || !price_per_gram || !category) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      );
    }
    
    // Вставка продукта
    const [result] = await connection.query(
      `INSERT INTO products 
       (name, description, price_per_gram, category, form_type, is_active) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, description, price_per_gram, category, form_type, is_active]
    );
    const productId = (result as any).insertId;
    
    // Обновление связей с упаковками
    if (packaging.length > 0) {
      const values = packaging.map((pid: number) => [productId, pid]);
      await connection.query(
        `INSERT INTO product_packaging (product_id, packaging_type_id) VALUES ?`,
        [values]
      );
    }
    
    await connection.commit();
    return NextResponse.json({ id: productId, success: true }, { status: 201 });
  } catch (error) {
    await connection.rollback();
    console.error('Ошибка создания продукта:', error);
    return NextResponse.json(
      { error: 'Ошибка создания продукта' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Обновление продукта
export async function PUT(request: NextRequest) {
  const connection = await pool.getConnection();
  
  try {
    await connection.beginTransaction();
    
    const url = new URL(request.url);
    const productId = parseInt(url.searchParams.get('id') || '0');
    
    if (!productId) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Не указан ID продукта' },
        { status: 400 }
      );
    }
    
    const data = await request.json();
    const {
      name,
      description = '',
      price_per_gram,
      category,
      form_type = null,
      is_active = 1,
      packaging = []
    } = data;
    
    // Проверка обязательных полей
    if (!name || !price_per_gram || !category) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      );
    }
    
    // Проверка существования продукта
    const [existing] = await connection.query<mysql.RowDataPacket[]>(
      `SELECT id FROM products WHERE id = ?`,
      [productId]
    );
    
    if (existing.length === 0) {
      await connection.rollback();
      return NextResponse.json(
        { error: 'Продукт не найден' },
        { status: 404 }
      );
    }
    
    // Обновление продукта
    await connection.query(
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
    
    // Обновление связей с упаковками
    await connection.query(
      `DELETE FROM product_packaging WHERE product_id = ?`, 
      [productId]
    );
    
    if (packaging.length > 0) {
      const values = packaging.map((pid: number) => [productId, pid]);
      await connection.query(
        `INSERT INTO product_packaging (product_id, packaging_type_id) VALUES ?`,
        [values]
      );
    }
    
    await connection.commit();
    return NextResponse.json({ success: true });
  } catch (error) {
    await connection.rollback();
    console.error('Ошибка обновления продукта:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления продукта' },
      { status: 500 }
    );
  } finally {
    connection.release();
  }
}

// Удаление продукта
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = parseInt(url.searchParams.get('id') || '0');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'Не указан ID продукта' },
        { status: 400 }
      );
    }
    
    // Проверка связей с заказами
    const [orderCheck] = await pool.query<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as count FROM order_items WHERE product_id = ?`, 
      [productId]
    );
    
    if ((orderCheck[0] as any).count > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить продукт, который используется в заказах' }, 
        { status: 400 }
      );
    }
    
    // Удаление связей и самого продукта
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