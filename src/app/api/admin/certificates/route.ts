import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { promises as fs } from 'fs';
import { join } from 'path';
import { ensureUploadDirs } from '@/lib/utils';

const CERTIFICATE_UPLOAD_DIR = join(process.cwd(), 'public', 'uploads', 'certificate_file');

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT id, number, pdf_file FROM certificate_file ORDER BY number ASC');
    return NextResponse.json(rows);
  } catch (error: any) {
    console.error('Ошибка загрузки сертификатов:', error.message);
    return NextResponse.json(
      { error: 'Не удалось загрузить сертификаты', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureUploadDirs();

    const formData = await req.formData();
    const number = formData.get('number')?.toString();
    const file = formData.get('pdf_file') as File | null;

    if (!number || !file) {
      return NextResponse.json({ error: 'Не указаны данные сертификата' }, { status: 400 });
    }

    // Сохранение файла
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `cert_${Date.now()}_${file.name}`;
    const filePath = join(CERTIFICATE_UPLOAD_DIR, fileName);

    await fs.writeFile(filePath, buffer);

    // Сохранение в базу данных
    const [result] = await pool.query(
      'INSERT INTO certificate_file (number, pdf_file) VALUES (?, ?)',
      [number, fileName]
    );

    return NextResponse.json({ success: true, id: (result as any).insertId });
  } catch (error: any) {
    console.error('Ошибка при создании сертификата:', error.message);
    return NextResponse.json(
      { error: 'Ошибка сервера', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const certId = searchParams.get('id');

    if (!certId) {
      return NextResponse.json({ error: 'Не указан ID сертификата' }, { status: 400 });
    }

    // Получаем имя файла перед удалением
    const [rows] = await pool.query('SELECT pdf_file FROM certificate_file WHERE id = ?', [certId]);

    if (Array.isArray(rows) && rows.length > 0) {
      const cert = rows[0] as { pdf_file: string };
      if (cert.pdf_file) {
        const filePath = join(CERTIFICATE_UPLOAD_DIR, cert.pdf_file);
        try {
          await fs.unlink(filePath);
        } catch (err) {
          console.warn('Не удалось удалить файл:', cert.pdf_file);
        }
      }
    }

    // Удаление из БД
    await pool.query('DELETE FROM certificate_file WHERE id = ?', [certId]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ошибка при удалении сертификата:', error.message);
    return NextResponse.json(
      { error: 'Ошибка сервера', details: error.message },
      { status: 500 }
    );
  }
}