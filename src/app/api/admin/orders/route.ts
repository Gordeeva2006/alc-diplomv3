import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { promises as fs } from 'fs';
import { join } from 'path';

// Папки для загрузки файлов
const CONTRACT_DIR = join(process.cwd(), 'public', 'uploads', 'contracts');
const CERTIFICATE_DIR = join(process.cwd(), 'public', 'uploads', 'certificate_file');

// Функция для создания папок
async function ensureUploadDirs() {
  for (const dir of [CONTRACT_DIR, CERTIFICATE_DIR]) {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('pageSize') || '10');

  const offset = (page - 1) * pageSize;

  let sql = `
    SELECT 
      o.id,
      o.total_amount,
      s.name AS status_name,
      o.contract_file,
      o.certificate_file,
      o.created_at,
      c.type AS client_type,
      c.legal_address,
      u.email AS client_email,
      u.phone AS client_phone,
      i.company_name AS individual_company,
      i.inn AS individual_inn,
      i.ogrnip AS individual_ogrnip,
      l.company_name AS legal_entity_company,
      l.inn AS legal_entity_inn,
      l.kpp AS legal_entity_kpp,
      l.ogrn AS legal_entity_ogrn
    FROM orders o
    JOIN clients c ON o.client_id = c.id
    JOIN users u ON c.user_id = u.id
    JOIN statuses s ON o.status = s.id
    LEFT JOIN individuals i ON c.id = i.client_id
    LEFT JOIN legal_entities l ON c.id = l.client_id
  `;

  const params: any[] = [];

  if (status) {
    sql += ` WHERE o.status = ?`;
    params.push(parseInt(status));
  }

  if (search) {
    if (status) {
      sql += ` AND (o.id LIKE ? OR u.email LIKE ? OR c.legal_address LIKE ?)`;
    } else {
      sql += ` WHERE (o.id LIKE ? OR u.email LIKE ? OR c.legal_address LIKE ?)`;
    }
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  sql += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
  params.push(pageSize, offset);

  try {
    const [orders] = await pool.query(sql, params);

    let totalSql = `
      SELECT COUNT(*) as count
      FROM orders o
      JOIN clients c ON o.client_id = c.id
      JOIN users u ON c.user_id = u.id
    `;
    const totalParams: any[] = [];

    if (status || search) {
      totalSql += ` WHERE `;
      if (status) {
        totalSql += `o.status = ?`;
        totalParams.push(parseInt(status));
        if (search) {
          totalSql += ` AND `;
        }
      }
      if (search) {
        totalSql += `(o.id LIKE ? OR u.email LIKE ? OR c.legal_address LIKE ?)`;
        totalParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
    }

    const [totalResult] = await pool.query(totalSql, totalParams);
    const total = totalResult[0].count;

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        pageSize,
        total
      }
    });
  } catch (error: any) {
    console.error('Ошибка при получении заказов:', error.message);
    return NextResponse.json({ error: 'Ошибка сервера', details: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureUploadDirs();

    const formData = await req.formData();
    const id = formData.get('id')?.toString();
    const status = formData.get('status')?.toString();
    const certificateFiles = formData.getAll('certificate_file') as File[];
    const contractFile = formData.get('contract') as File | null;

    if (!id) {
      return NextResponse.json({ error: 'Не указан ID заказа' }, { status: 400 });
    }

    const orderId = parseInt(id);

    // Подготовка обновлений
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Обновление статуса
    if (status) {
      const [statusCheck] = await pool.query('SELECT id FROM statuses WHERE id = ?', [parseInt(status)]);
      if (!Array.isArray(statusCheck) || statusCheck.length === 0) {
        return NextResponse.json({ error: 'Указанный статус не найден' }, { status: 400 });
      }
      updateFields.push('status = ?');
      updateValues.push(parseInt(status));
    }

    // Обработка файла договора
    if (contractFile) {
      const buffer = Buffer.from(await contractFile.arrayBuffer());
      const contractFileName = `order_${orderId}_${Date.now()}_${contractFile.name}`;
      const contractPath = join(CONTRACT_DIR, contractFileName);
      await fs.writeFile(contractPath, buffer);
      updateFields.push('contract_file = ?');
      updateValues.push(contractFileName);
    }

    // Обработка файлов сертификатов
    if (certificateFiles.length > 0) {
      const certFilenames: string[] = [];

      for (const file of certificateFiles) {
        const buffer = Buffer.from(await file.arrayBuffer());
        const certFileName = `cert_${orderId}_${Date.now()}_${file.name}`;
        const certPath = join(CERTIFICATE_DIR, certFileName);
        await fs.writeFile(certPath, buffer);
        certFilenames.push(certFileName);
      }

      updateFields.push('certificate_file = ?');
      updateValues.push(certFilenames.join(','));
    }

    // Добавление ID в конец
    updateFields.push('id = ?');
    updateValues.push(orderId);

    if (updateFields.length > 0) {
      const updateSql = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;
      await pool.query(updateSql, [...updateValues, orderId]);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ошибка при обновлении заказа:', error.message);
    return NextResponse.json({ error: 'Ошибка сервера', details: error.message }, { status: 500 });
  }
}