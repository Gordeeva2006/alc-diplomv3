import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import { promises as fs } from 'fs';
import { join } from 'path';
import { RowDataPacket } from 'mysql2';

// Папки для загрузки файлов
const CONTRACT_DIR = join(process.cwd(), 'public', 'uploads', 'contracts');
const CERTIFICATE_DIR = join(process.cwd(), 'public', 'uploads', 'certificates');

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

// Типы для данных
interface PackagingType extends RowDataPacket {
  id: number;
  name: string;
  image: string | null;
}

interface OrderItem extends RowDataPacket {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  batch_volume: number;
  packaging_type_id: number | null;
  packaging_type_name: string | null;
  packaging_type_image: string | null;
}

interface Order extends RowDataPacket {
  id: number;
  total_amount: string;
  status_name: string;
  contract_file: string | null;
  certificate_file: string | null;
  created_at: string;
  client_type: 'individual' | 'legal_entity';
  legal_address: string;
  client_email: string;
  client_phone: string;
  individual_company: string | null;
  individual_inn: string | null;
  individual_ogrnip: string | null;
  legal_entity_company: string | null;
  legal_entity_inn: string | null;
  legal_entity_kpp: string | null;
  legal_entity_ogrn: string | null;
  items?: OrderItem[];
}

interface CountResult extends RowDataPacket {
  count: number;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search')?.trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '10')));
  const offset = (page - 1) * pageSize;

  try {
    // Основной запрос с добавленными полями упаковки
    let sql = `
      SELECT 
        o.id,
        o.total_amount,
        s.name AS status_name,
        o.contract_file,
        o.certificate_file,
        DATE_FORMAT(o.created_at, '%d.%m.%Y') AS created_at,
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
        l.ogrn AS legal_entity_ogrn,
        oi.product_id,
        p.name AS product_name,
        oi.quantity,
        oi.unit_price,
        oi.batch_volume,
        pt.id AS packaging_type_id,
        pt.name AS packaging_type_name,
        pt.image AS packaging_type_image
      FROM orders o
      JOIN clients c ON o.client_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN statuses s ON o.status = s.id
      LEFT JOIN individuals i ON c.id = i.client_id
      LEFT JOIN legal_entities l ON c.id = l.client_id
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN products p ON oi.product_id = p.id
      LEFT JOIN packaging_types pt ON oi.packaging_type_id = pt.id
    `;

    const params: any[] = [];

    // Фильтрация по статусу
    if (status) {
      sql += ` WHERE o.status = ?`;
      params.push(parseInt(status));
    }

    // Поиск
    if (search) {
      const searchPattern = `%${search}%`;
      if (status) {
        sql += ` AND (o.id LIKE ? OR u.email LIKE ? OR c.legal_address LIKE ?)`;
      } else {
        sql += ` WHERE (o.id LIKE ? OR u.email LIKE ? OR c.legal_address LIKE ?)`;
      }
      params.push(searchPattern, searchPattern, searchPattern);
    }

    sql += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
    params.push(pageSize, offset);

    // Выполняем основной запрос
    const [orders] = await pool.query<Order[]>(sql, params);

    const groupedOrders = orders.reduce((acc: Record<number, Order>, item) => {

      if (!acc[item.id]) {
        acc[item.id] = {
          ...item,
          items: [],
          total_amount: parseFloat(item.total_amount).toFixed(2),
        };
      }

      if (item.product_id) {
        acc[item.id].items!.push({
          product_id: item.product_id,
          product_name: item.product_name,
          quantity: item.quantity,
          unit_price: parseFloat(item.unit_price),
          batch_volume: item.batch_volume,
          packaging_type_id: item.packaging_type_id,
          packaging_type_name: item.packaging_type_name,
          packaging_type_image: item.packaging_type_image
        });
      }

      return acc;
    }, {});

    // Запрос общего количества записей
    let countSql = `
      SELECT COUNT(DISTINCT o.id) as count
      FROM orders o
      JOIN clients c ON o.client_id = c.id
      JOIN users u ON c.user_id = u.id
    `;

    const countParams: any[] = [];

    if (status || search) {
      countSql += ` WHERE`;
      const conditions = [];
      if (status) {
        conditions.push(`o.status = ?`);
        countParams.push(parseInt(status));
      }
      if (search) {
        conditions.push(`(o.id LIKE ? OR u.email LIKE ? OR c.legal_address LIKE ?)`);
        countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      countSql += ` ${conditions.join(' AND ')}`;
    }

    const [totalResult] = await pool.query<CountResult[]>(countSql, countParams);
    const total = totalResult[0]?.count || 0;

    return NextResponse.json({
      data: Object.values(groupedOrders),
      pagination: {
        page,
        pageSize,
        total,
      },
    });
  } catch (error: any) {
    console.error('Ошибка при получении заявок:', {
      message: error.message,
      stack: error.stack,
      code: error.code
    });
    return NextResponse.json({ 
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Произошла ошибка при обработке запроса'
    }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await ensureUploadDirs();
    const formData = await req.formData();
    
    const id = formData.get('id')?.toString();
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Неверный ID заявки' }, { status: 400 });
    }
    const orderId = parseInt(id);
    
    // Проверка существования заявки
    const [existingOrder] = await pool.query<{ id: number }[]>(
      'SELECT id FROM orders WHERE id = ?', 
      [orderId]
    );
    
    if (existingOrder.length === 0) {
      // Создаем новый заявка
      await pool.query(
        'INSERT INTO orders (id, status, client_id) VALUES (?, ?, ?)', 
        [orderId, 1, 1] // Укажите реальные данные клиента и статуса
      );
    }
    
    const updateFields: string[] = [];
    const updateValues: any[] = [];
    
    // Обновление статуса
    const status = formData.get('status')?.toString();
    if (status && !isNaN(parseInt(status))) {
      const [statusCheck] = await pool.query<{ id: number }[]>(
        'SELECT id FROM statuses WHERE id = ?', 
        [parseInt(status)]
      );
      
      if (!Array.isArray(statusCheck) || statusCheck.length === 0) {
        return NextResponse.json(
          { error: 'Указанный статус не найден' },
          { status: 400 }
        );
      }
      
      updateFields.push('status = ?');
      updateValues.push(parseInt(status));
    }
    
    // Обработка загрузки договора
    const contractFile = formData.get('contract') as File | null;
    if (contractFile && contractFile.size > 0) {
      const [existingOrderRow] = await pool.query<{ contract_file: string | null }[]>(
        'SELECT contract_file FROM orders WHERE id = ?', 
        [orderId]
      );
      
      const oldContractFile = existingOrderRow[0]?.contract_file;
      if (oldContractFile) {
        const oldFilePath = join(CONTRACT_DIR, oldContractFile);
        try {
          await fs.unlink(oldFilePath);
        } catch (e) {
          console.error('Ошибка удаления старого файла:', e);
        }
      }
      
      const safeFileName = `${Date.now()}-${contractFile.name.replace(/[^a-z0-9.]/gi, '_')}`;
      const contractFileName = `order_${orderId}_${safeFileName}`;
      const contractPath = join(CONTRACT_DIR, contractFileName);
      const buffer = Buffer.from(await contractFile.arrayBuffer());
      await fs.writeFile(contractPath, buffer);
      
      updateFields.push('contract_file = ?');
      updateValues.push(contractFileName);
    } else if (!contractFile && formData.get('delete_contract') !== 'true') {
      // Явно обнуляем, если файл не загружен
      updateFields.push('contract_file = ?');
      updateValues.push(null);
    }
    
    // Обработка загрузки сертификатов
    const certificateFiles = formData.getAll('certificate_file') as File[];
    if (certificateFiles.length > 0) {
      const [existingOrderRow] = await pool.query<{ certificate_file: string | null }[]>(
        'SELECT certificate_file FROM orders WHERE id = ?', 
        [orderId]
      );
      
      const oldCertificateFiles = existingOrderRow[0]?.certificate_file?.split(',') || [];
      const certFilenames: string[] = [];
      
      for (const file of certificateFiles) {
        if (!(file instanceof File) || file.size === 0) continue;
        
        const safeFileName = `${Date.now()}-${file.name.replace(/[^a-z0-9.]/gi, '_')}`;
        const certFileName = `cert_${orderId}_${safeFileName}`;
        const certPath = join(CERTIFICATE_DIR, certFileName);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(certPath, buffer);
        
        certFilenames.push(certFileName);
      }
      
      if (certFilenames.length > 0) {
        // Удаляем старые сертификаты, если они были
        for (const oldCert of oldCertificateFiles) {
          try {
            const filePath = join(CERTIFICATE_DIR, oldCert);
            await fs.unlink(filePath);
          } catch (e) {
            console.error('Ошибка удаления старого сертификата:', e);
          }
        }
        
        updateFields.push('certificate_file = ?');
        updateValues.push(certFilenames.join(','));
      }
    }
    
    // Удаление договора
    const delete_contract = formData.get('delete_contract') === 'true';
    if (delete_contract) {
      const [existingOrderRow] = await pool.query<{ contract_file: string | null }[]>(
        'SELECT contract_file FROM orders WHERE id = ?', 
        [orderId]
      );
      
      const oldContractFile = existingOrderRow[0]?.contract_file;
      if (oldContractFile) {
        const filePath = join(CONTRACT_DIR, oldContractFile);
        try {
          await fs.unlink(filePath);
        } catch (e) {
          console.error('Ошибка удаления файла:', e);
        }
      }
      
      updateFields.push('contract_file = ?');
      updateValues.push(null);
    }
    
    // Удаление сертификата
    const delete_certificate = formData.get('delete_certificate')?.toString().trim();
    if (delete_certificate) {
      const [existingOrderRow] = await pool.query<{ certificate_file: string | null }[]>(
        'SELECT certificate_file FROM orders WHERE id = ?', 
        [orderId]
      );
      
      const existingCerts = existingOrderRow[0]?.certificate_file?.split(',') || [];
      const newCerts = existingCerts.filter(c => c !== delete_certificate);
      
      try {
        const filePath = join(CERTIFICATE_DIR, delete_certificate);
        await fs.unlink(filePath);
      } catch (e) {
        console.error('Ошибка удаления сертификата:', e);
      }
      
      updateFields.push('certificate_file = ?');
      updateValues.push(newCerts.join(',') || null);
    }
    
    // Обновление в БД
    if (updateFields.length > 0) {
      const updateSql = `UPDATE orders SET ${updateFields.join(', ')} WHERE id = ?`;
      await pool.query(updateSql, [...updateValues, orderId]);
    } else {
      return NextResponse.json({ error: 'Нет данных для обновления' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Ошибка при обновлении заявки:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      error: 'Ошибка сервера',
      details: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Произошла ошибка при обработке запроса'
    }, { status: 500 });
  }
}