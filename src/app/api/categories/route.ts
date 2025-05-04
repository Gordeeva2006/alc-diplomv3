import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const [rows]: any = await pool.query("SELECT id, name FROM categorys ORDER BY name ASC");
    return NextResponse.json(rows, { status: 200 });
  } catch (error) {
    console.error("Ошибка получения категорий:", error);
    return NextResponse.json({ error: "Не удалось получить список категорий" }, { status: 500 });
  }
}