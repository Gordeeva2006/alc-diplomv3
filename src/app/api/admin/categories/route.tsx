import { NextRequest, NextResponse } from 'next/server';
import { pool } from "@/lib/db";

// Получение всех категорий
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM categorys ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Ошибка загрузки категорий:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить категории' }, 
      { status: 500 }
    );
  }
}

// Добавление категории
export async function POST(request: NextRequest) {
  try {
    const { name, description } = await request.json();
    
    // Проверка на дубликаты
    const [existing] = await pool.query(
      'SELECT id FROM categorys WHERE name = ?', 
      [name]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'Категория с таким названием уже существует' },
        { status: 400 }
      );
    }
    
    await pool.query(
      'INSERT INTO categorys (name, description) VALUES (?, ?)', 
      [name, description || null]
    );
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания категории:', error);
    return NextResponse.json(
      { error: 'Не удалось создать категорию' }, 
      { status: 500 }
    );
  }
}

// Обновление категории
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    const { name, description } = await request.json();

    // Проверка ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID категории не указан' },
        { status: 400 }
      );
    }

    // Проверка существования
    const [existing] = await pool.query(
      'SELECT id FROM categorys WHERE id = ?', 
      [id]
    );
    
    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json(
        { error: 'Категория не найдена' },
        { status: 404 }
      );
    }

    // Проверка на дубликаты
    const [duplicateCheck] = await pool.query(
      'SELECT id FROM categorys WHERE name = ? AND id != ?', 
      [name, id]
    );
    
    if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
      return NextResponse.json(
        { error: 'Категория с таким названием уже существует' },
        { status: 400 }
      );
    }

    // Проверка использования в продуктах
    const [usedInProducts] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE category = ?',
      [id]
    );
    
    if (usedInProducts && Array.isArray(usedInProducts) && usedInProducts[0].count > 0) {
      return NextResponse.json(
        { error: 'Нельзя редактировать категорию, которая используется в продуктах' },
        { status: 400 }
      );
    }

    // Обновление
    await pool.query(
      'UPDATE categorys SET name = ?, description = ? WHERE id = ?', 
      [name, description || null, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления категории:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления категории' },
      { status: 500 }
    );
  }
}

// Удаление категории
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');

    // Проверка ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID категории не указан' },
        { status: 400 }
      );
    }

    // Проверка использования в продуктах
    const [usedInProducts] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE category = ?',
      [id]
    );
    
    if (usedInProducts && Array.isArray(usedInProducts) && usedInProducts[0].count > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить категорию, которая используется в продуктах' },
        { status: 400 }
      );
    }

    // Удаление
    await pool.query('DELETE FROM categorys WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления категории:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления категории' },
      { status: 500 }
    );
  }
}