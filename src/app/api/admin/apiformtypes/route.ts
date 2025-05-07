// app/api/admin/apiformtypes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from "@/lib/db";

// Получение типов форм
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM form_types ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Ошибка загрузки типов форм:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить типы форм' }, 
      { status: 500 }
    );
  }
}

// Добавление типа формы
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    // Проверка на дубликаты
    const [existing] = await pool.query(
      'SELECT id FROM form_types WHERE name = ?',
      [name]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'Тип формы с таким названием уже существует' },
        { status: 400 }
      );
    }
    
    await pool.query('INSERT INTO form_types (name) VALUES (?)', [name]);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания типа формы:', error);
    return NextResponse.json(
      { error: 'Не удалось создать тип формы' }, 
      { status: 500 }
    );
  }
}

// Обновление типа формы
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    const { name } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID типа формы не указан' },
        { status: 400 }
      );
    }

    // Проверка существования
    const [existing] = await pool.query(
      'SELECT id FROM form_types WHERE id = ?', 
      [id]
    );
    
    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json(
        { error: 'Тип формы не найден' },
        { status: 404 }
      );
    }

    // Проверка на дубликаты
    const [duplicateCheck] = await pool.query(
      'SELECT id FROM form_types WHERE name = ? AND id != ?', 
      [name, id]
    );
    
    if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
      return NextResponse.json(
        { error: 'Тип формы с таким названием уже существует' },
        { status: 400 }
      );
    }

    // Проверка использования в продуктах
    const [usedInProducts] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE form_type = ?',
      [id]
    );
    
    if (usedInProducts && Array.isArray(usedInProducts) && usedInProducts[0].count > 0) {
      return NextResponse.json(
        { error: 'Нельзя редактировать тип формы, который используется в продуктах' },
        { status: 400 }
      );
    }

    // Обновление
    await pool.query('UPDATE form_types SET name = ? WHERE id = ?', [name, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления типа формы:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления типа формы' },
      { status: 500 }
    );
  }
}

// Удаление типа формы
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');

    if (!id) {
      return NextResponse.json(
        { error: 'ID типа формы не указан' },
        { status: 400 }
      );
    }

    // Проверка использования в продуктах
    const [usedInProducts] = await pool.query(
      'SELECT COUNT(*) AS count FROM products WHERE form_type = ?',
      [id]
    );
    
    if (usedInProducts && Array.isArray(usedInProducts) && usedInProducts[0].count > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить тип формы, который используется в продуктах' },
        { status: 400 }
      );
    }

    // Удаление
    await pool.query('DELETE FROM form_types WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления типа формы:', error);
    return NextResponse.json