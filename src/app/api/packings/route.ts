import { NextRequest } from "next/server";
import { pool } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const connection = await pool.getConnection();
    const query = `
      SELECT 
        pt.id,
        pt.name,
        m.name AS materialName,
        pt.volume,
        u.name AS unitName,
        pt.image
      FROM packaging_types pt
      LEFT JOIN materials m ON pt.material = m.id
      LEFT JOIN units u ON pt.unit = u.id
    `;
    const [rows] = await connection.query(query);
    connection.release();

    const parsedRows = rows.map(row => ({
      ...row,
      volume: parseFloat(row.volume) || 0
    }));

    return new Response(JSON.stringify(parsedRows), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching packings:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch packings' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}