import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import { pool } from '@/lib/db';

// Типизация данных из БД
interface ProductRow {
  product_id: number;
  product_name: string;
  product_description: string;
  price_per_gram: number;
  category_name: string;
  form_type_name: string | null;
  packaging_id: number | null;
  packaging_name: string | null;
  packaging_volume: number | null;
  packaging_unit: string | null;
  packaging_image: string | null; // Поле изображения
}

interface PackagingOption {
  id: number;
  name: string;
  volume: number;
  unit: string;
  image: string | null; // Поле изображения
}

interface Product {
  id: number;
  name: string;
  description: string;
  price_per_gram: number;
  category_name: string;
  form_type_name: string | null;
  packagingOptions: PackagingOption[];
}

export async function GET() {
  try {
    // Запрос к БД с фильтром по активным продуктам
    const [rows] = await pool.query<ProductRow[]>(`
      SELECT 
        p.id AS product_id,
        p.name AS product_name,
        p.description AS product_description,
        p.price_per_gram,
        c.name AS category_name,
        f.name AS form_type_name,
        pt.id AS packaging_id,
        pt.name AS packaging_name,
        pt.volume AS packaging_volume,
        pt.unit AS packaging_unit,
        pt.image AS packaging_image -- Добавлено поле изображения
      FROM products p
      INNER JOIN categorys c ON p.category = c.id
      LEFT JOIN form_types f ON p.form_type = f.id
      LEFT JOIN product_packaging pp ON p.id = pp.product_id
      LEFT JOIN packaging_types pt ON pp.packaging_type_id = pt.id
      WHERE p.is_active = TRUE
      ORDER BY p.id, pt.id
    `);

    // Группировка продуктов с упаковками
    const productsMap = new Map<number, Product>();
    for (const row of rows) {
      const productId = row.product_id;
      if (!productsMap.has(productId)) {
        productsMap.set(productId, {
          id: productId,
          name: row.product_name,
          description: row.product_description,
          price_per_gram: row.price_per_gram,
          category_name: row.category_name,
          form_type_name: row.form_type_name,
          packagingOptions: [],
        });
      }
      const product = productsMap.get(productId)!;

      // Добавляем уникальные упаковки
      if (
        row.packaging_id &&
        !product.packagingOptions.some(pkg => pkg.id === row.packaging_id)
      ) {
        product.packagingOptions.push({
          id: row.packaging_id,
          name: row.packaging_name!,
          volume: row.packaging_volume!,
          unit: row.packaging_unit!,
          image: row.packaging_image, // Добавлено поле изображения
        });
      }
    }

    return NextResponse.json([...productsMap.values()], { status: 200 });
  } catch (error) {
    console.error('Ошибка загрузки продуктов:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: 'Не удалось загрузить продукты' },
      { status: 500 }
    );
  }
}