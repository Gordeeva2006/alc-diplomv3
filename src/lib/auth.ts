import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import mysql from "mysql2/promise"
import bcrypt from "bcryptjs"

// Обновлённый тип пользователя — роль теперь строка
type User = {
  id: number
  email: string
  role: string // ❗ Теперь строка
  phone: string | null
}

// Подключение к базе данных
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "albumen_development",
})

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email и пароль обязательны")
        }

        try {
          // ✅ Изменён SQL-запрос: JOIN с таблицей roles и выборка role.name как role_name
          const [rows] = await pool.query(
            `
            SELECT u.id, u.email, u.password_hash, u.phone, r.name AS role_name
            FROM users u
            LEFT JOIN roles r ON u.role = r.id
            WHERE u.email = ?
            `,
            [credentials.email]
          )

          const users = rows as Array<{
            id: number
            email: string
            password_hash: string
            phone: string | null
            role_name: string | null
          }>

          if (users.length === 0) {
            throw new Error("Пользователь не найден")
          }

          const user = users[0]
          const isValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isValid) {
            throw new Error("Неверный пароль")
          }

          // ✅ Теперь возвращаем строку role (название роли)
          return {
            id: user.id,
            email: user.email,
            role: user.role_name || "user", // Если роль не найдена — по умолчанию 'user'
            phone: user.phone || null,
          } as User
        } catch (error) {
          console.error("Ошибка аутентификации:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = user.role // ✅ Теперь строка
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.role = token.role as string // ✅ Теперь строка
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
}