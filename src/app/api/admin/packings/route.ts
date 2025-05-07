// app/api/admin/packings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { pool } from "@/lib/db";

// Получение всех упаковок с привязкой к внешним сущностям
export async function GET(request: NextRequest) {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      `SELECT 
         pt.id, 
         pt.name, 
         m.name AS material_name, 
         pt.material AS material_id,
         pt.volume, 
         u.name AS unit_name, 
         pt.unit AS unit_id,
         pt.image
       FROM packaging_types pt
       LEFT JOIN materials m ON pt.material = m.id
       LEFT JOIN units u ON pt.unit = u.id`
    );
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error('Ошибка загрузки упаковок:', error);
    return NextResponse.json({ error: 'Ошибка загрузки упаковок' }, { status: 500 });
  }
}

// Создание новой упаковки
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const material_id = formData.get('material') as string;
    const volume = parseFloat(formData.get('volume') as string);
    const unit_id = formData.get('unit') as string;
    const file = formData.get('image') as File;

    // Проверка обязательных полей
    if (!name || !volume || !unit_id) {
      return NextResponse.json(
        { error: 'Не все обязательные поля заполнены' },
        { status: 400 }
      );
    }

    // Обработка изображения
    let imagePath = null;
    if (file && file.size > 0) {
      const ext = path.extname(file.name).toLowerCase();
      const filename = `${uuidv4()}${ext}`;
      const uploadPath = path.join(process.cwd(), 'public', 'images', 'packings', filename);
      
      // Создание директории, если её нет
      const dir = path.dirname(uploadPath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      // Сохранение файла
      const buffer = await file.arrayBuffer();
      fs.writeFileSync(uploadPath, Buffer.from(buffer));
      imagePath = `/images/packings/${filename}`;
    }

    // Вставка записи
    await pool.query(
      `INSERT INTO packaging_types 
       (name, material, volume, unit, image) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        name, 
        Number(material_id || null), 
        volume, 
        Number(unit_id || null), 
        imagePath
      ]
    );
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error('Ошибка создания упаковки:', error);
    return NextResponse.json({ error: 'Ошибка создания упаковки' }, { status: 500 });
  }
}

// Обновление упаковки
export async function PUT(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID упаковки не указан' },
        { status: 400 }
      );
    }
    
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const material_id = formData.get('material') as string;
    const volume = parseFloat(formData.get('volume') as string);
    const unit_id = formData.get('unit') as string;
    const file = formData.get('image') as File;
    
    // Обработка изображения
    let imagePath = null;
    if (file && file.size > 0) {
      const ext = path.extname(file.name).toLowerCase();
      const filename = `${uuidv4()}${ext}`;
      const uploadPath = path.join(process.cwd(), 'public', 'images', 'packings', filename);
      const dir = path.dirname(uploadPath);
      
      // Создание директории, если её нет
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      
      // Сохранение файла
      const buffer = await file.arrayBuffer();
      fs.writeFileSync(uploadPath, Buffer.from(buffer));
      imagePath = `/images/packings/${filename}`;
    }
    
    // Проверка существования связанных записей
    const checkForeignKey = async (table: string, id: number | null, fieldName: string) => {
      if (id === null) return true;
      const [rows] = await pool.query<RowDataPacket[]>(
        `SELECT id FROM ${table} WHERE id = ?`, 
        [id]
      );
      return rows.length > 0;
    };
    
    const materialExists = await checkForeignKey('materials', Number(material_id), 'material');
    const unitExists = await checkForeignKey('units', Number(unit_id), 'unit');
    
    if (!materialExists) {
      return NextResponse.json(
        { error: `Материал с ID ${material_id} не найден` },
        { status: 400 }
      );
    }
    
    if (!unitExists) {
      return NextResponse.json(
        { error: `Единица измерения с ID ${unit_id} не найдена` },
        { status: 400 }
      );
    }
    
    // Обновление записи
    await pool.query(
      `UPDATE packaging_types SET 
         name = ?, 
         material = ?, 
         volume = ?, 
         unit = ?, 
         image = ?
       WHERE id = ?`,
      [name, Number(material_id), volume, Number(unit_id), imagePath, id]
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления упаковки:', error);
    return NextResponse.json({ error: 'Ошибка обновления упаковки' }, { status: 500 });
  }
}

// Удаление упаковки
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const id = parseInt(url.searchParams.get('id') || '0');
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID упаковки не указан' },
        { status: 400 }
      );
    }
    
    // Проверка связей с продуктами
    const [productCheck] = await pool.query<RowDataPacket[]>(
      `SELECT COUNT(*) AS count FROM product_packaging WHERE packaging_type_id = ?`,
      [id]
    );
    
    if ((productCheck[0] as { count: number }).count > 0) {
      return NextResponse.json(
        { error: 'Нельзя удалить упаковку, которая используется в продуктах' },
        { status: 400 }
      );
    }
    
    // Удаление записи
    await pool.query(`DELETE FROM packaging_types WHERE id = ?`, [id]);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления упаковки:', error);
    return NextResponse.json({ error: 'Ошибка удаления упаковки' }, { status: 500 });
  }
}