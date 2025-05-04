// src/lib/auth.ts
import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { pool } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        try {
          const [rows] = await pool.query(
            `SELECT users.*, roles.name as role_name 
             FROM users 
             LEFT JOIN roles ON users.role = roles.id 
             WHERE email = ?`,
            [credentials.email]
          )

          const user = rows[0]
          
          if (!user) return null
          
          const isValid = await bcrypt.compare(
            credentials.password, 
            user.password_hash
          )

          if (!isValid) return null

          return {
            id: user.id.toString(),
            email: user.email,
            phone: user.phone,
            role: user.role_name,
            client: {
              id: user.client_id,
              phone: user.client_phone,
              legalAddress: user.legal_address,
              type: user.client_type,
              individual: user.individual
                ? {
                    inn: user.individual.inn,
                    companyName: user.individual.company_name,
                    ogrnip: user.individual.ogrnip
                  }
                : undefined,
              legalEntity: user.legal_entity
                ? {
                    inn: user.legal_entity.inn,
                    companyName: user.legal_entity.company_name,
                    kpp: user.legal_entity.kpp,
                    ogrn: user.legal_entity.ogrn
                  }
                : undefined
            }
          }
        } catch (error) {
          console.error("Auth error:", error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = user.phone
        token.role = user.role
        token.client = user.client
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id
        session.user.phone = token.phone
        session.user.role = token.role
        session.user.client = token.client
      }
      return session
    }
  },
  pages: {
    main: "/",
    error: "/auth/error"
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 дней
  },
  secret: process.env.NEXTAUTH_SECRET
}