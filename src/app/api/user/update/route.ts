// src/app/api/user/update/route.ts
import { NextRequest } from "next/server"
import { pool } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Неавторизован" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      })
    }

    const userId = parseInt(session.user.id)
    const data = await req.json()

    // Обновление пользователя
    await pool.query(
      "UPDATE users SET email = ?, phone = ? WHERE id = ?",
      [data.email, data.phone, userId]
    )

    // Обновление клиента
    if (data.client) {
      await pool.query(
        "UPDATE clients SET phone = ?, legal_address = ?, type = ? WHERE id = ?",
        [data.client.phone, data.client.legalAddress, data.client.type, data.client.id]
      )

      if (data.client.type === "individual" && data.client.individual) {
        await pool.query(
          "UPDATE individuals SET inn = ?, company_name = ?, ogrnip = ? WHERE client_id = ?",
          [data.client.individual.inn, data.client.individual.companyName, data.client.individual.ogrnip, data.client.id]
        )
      }

      if (data.client.type === "legal_entity" && data.client.legalEntity) {
        await pool.query(
          "UPDATE legal_entities SET inn = ?, company_name = ?, kpp = ?, ogrn = ? WHERE client_id = ?",
          [data.client.legalEntity.inn, data.client.legalEntity.companyName, data.client.legalEntity.kpp, data.client.legalEntity.ogrn, data.client.id]
        )
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return new Response(JSON.stringify({ error: "Ошибка сервера" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    })
  }
}