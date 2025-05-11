import { NextRequest } from "next/server";
import { pool } from "@/lib/db";

interface PackagingType {
  id: number;
  name: string;
  materialName: string | null;
  volume: string; // Comes as string from DB
  unitName: string | null;
  image: string | null;
}

export async function GET(req: NextRequest) {
  let connection = null;
  
  try {
    connection = await pool.getConnection();
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
    
    const [rows] = await connection.query<any[]>(query);
    connection.release();

    const parsedRows = rows.map((row: PackagingType) => ({
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
  } finally {
    if (connection) await connection.release();
  }
}