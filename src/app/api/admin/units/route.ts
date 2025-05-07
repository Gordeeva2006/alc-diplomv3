// app/api/admin/units/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from "@/lib/db";

// Получение единиц измерения
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM units ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Ошибка загрузки единиц измерения:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить единицы измерения' }, 
      { status: 500 }
    );
  }
}

// Добавление единицы
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    // Проверка на дубликаты
    const [existing] = await pool.query(
      'SELECT id FROM units WHERE name = ?', 
      [name]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'Единица измерения с таким названием уже существует' },
        { status: 400 }
      );
    }
    
    await pool.query('INSERT INTO units (name) VALUES (?)', [name]);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания единицы:', error);
    return NextResponse.json(
      { error: 'Не удалось создать единицу' }, 
      { status: 500 }
    );
  }
}

// Обновление единицы
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    const { name } = await request.json();

    // Проверка ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID единицы не указан' },
        { status: 400 }
      );
    }

    // Проверка существования
    const [existing] = await pool.query(
      'SELECT id FROM units WHERE id = ?', 
      [id]
    );
    
    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json(
        { error: 'Единица измерения не найдена' },
        { status: 404 }
      );
    }

    // Проверка дубликатов
    const [duplicateCheck] = await pool.query(
      'SELECT id FROM units WHERE name = ? AND id != ?', 
      [name, id]
    );
    
    if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
      return NextResponse.json(
        { error: 'Единица с таким названием уже существует' },
        { status: 400 }
      );
    }

    // Проверка использования в упаковках
    const [usedInPackaging] = await pool.query(
      'SELECT COUNT(*) AS count FROM packaging_types WHERE unit = ?',
      [id]
    );
    
    if (usedInPackaging && Array.isArray(usedInPackaging) && usedInPackaging[0].count > 0) {
      return NextResponse.json(
        { error: 'Нельзя редактировать единицу, которая используется в упаковках' },
        { status: 400 }
      );
    }

    // Обновление
    await pool.query('UPDATE units SET name = ? WHERE id = ?', [name, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления единицы:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления единицы' },
      { status: 500 }
    );
  }
}

// Удаление единицы
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');

    // Проверка ID
    if (!id) {
      return NextResponse.json(
        { error: 'ID единицы не указан' },
        { status: 400 }
      );
    }

    // Проверка использования в упаковках
    const [usedInPackaging] = await pool.query(
      'SELECT COUNT(*) AS count FROM packaging_types WHERE unit = ?',
      [id]
    );
    
    if (usedInPackaging && Array.isArray(usedInPackaging) && usedInPackaging[0].count > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить единицу, которая используется в упаковках' },
        { status: 400 }
      );
    }

    // Удаление
    await pool.query('DELETE FROM units WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления единицы:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления единицы' },
      { status: 500 }
    );
  }
}