// src/app/api/auth/[...nextauth]/route.ts
import { authOptions } from "@/lib/auth" // См. шаг 2
import { NextApiRequest, NextApiResponse } from "next"
import NextAuth from "next-auth"

// NextAuth возвращает обработчик запросов
const handler = NextAuth(authOptions)

// App Router требует именованные экспорт-функции для каждого метода
export { handler as GET, handler as POST }