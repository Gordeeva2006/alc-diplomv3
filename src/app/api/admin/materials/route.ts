// app/api/admin/materials/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { pool } from "@/lib/db";

// Получение материалов
export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM materials ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Ошибка загрузки материалов:', error);
    return NextResponse.json(
      { error: 'Не удалось загрузить материалы' }, 
      { status: 500 }
    );
  }
}

// Добавление материала
export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    
    // Проверка на дубликаты
    const [existing] = await pool.query(
      'SELECT id FROM materials WHERE name = ?',
      [name]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        { error: 'Материал с таким названием уже существует' },
        { status: 400 }
      );
    }
    
    await pool.query('INSERT INTO materials (name) VALUES (?)', [name]);
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания материала:', error);
    return NextResponse.json(
      { error: 'Не удалось создать материал' }, 
      { status: 500 }
    );
  }
}

// Обновление материала
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    const { name } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID материала не указан' },
        { status: 400 }
      );
    }
    
    // Проверка существования материала
    const [existing] = await pool.query(
      'SELECT id FROM materials WHERE id = ?',
      [id]
    );
    
    if (!Array.isArray(existing) || existing.length === 0) {
      return NextResponse.json(
        { error: 'Материал не найден' },
        { status: 404 }
      );
    }
    
    // Проверка на дубликаты
    const [duplicateCheck] = await pool.query(
      'SELECT id FROM materials WHERE name = ? AND id != ?',
      [name, id]
    );
    
    if (Array.isArray(duplicateCheck) && duplicateCheck.length > 0) {
      return NextResponse.json(
        { error: 'Материал с таким названием уже существует' },
        { status: 400 }
      );
    }
    
    // Проверка использования в упаковках
    const [usedInPackaging] = await pool.query(
      'SELECT COUNT(*) AS count FROM packaging_types WHERE material = ?',
      [id]
    );
    
    if (usedInPackaging && Array.isArray(usedInPackaging) && usedInPackaging[0].count > 0) {
      return NextResponse.json(
        { error: 'Нельзя редактировать материал, который используется в упаковках' },
        { status: 400 }
      );
    }
    
    // Обновление материала
    await pool.query('UPDATE materials SET name = ? WHERE id = ?', [name, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления материала:', error);
    return NextResponse.json(
      { error: 'Ошибка обновления материала' },
      { status: 500 }
    );
  }
}

// Удаление материала
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID материала не указан' },
        { status: 400 }
      );
    }
    
    // Проверка использования в упаковках
    const [usedInPackaging] = await pool.query(
      'SELECT COUNT(*) AS count FROM packaging_types WHERE material = ?',
      [id]
    );
    
    if (usedInPackaging && Array.isArray(usedInPackaging) && usedInPackaging[0].count > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить материал, который используется в упаковках' },
        { status: 400 }
      );
    }
    
    // Удаление материала
    await pool.query('DELETE FROM materials WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления материала:', error);
    return NextResponse.json(
      { error: 'Ошибка удаления материала' },
      { status: 500 }
    );
  }
}