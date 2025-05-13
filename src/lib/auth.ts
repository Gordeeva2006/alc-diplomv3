import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

// Типы данных
type User = {
  id: number;
  email: string;
  phone: string | null;
  role: string; // Роль как строка (например, 'admin', 'user')
  client: {
    id: number;
    type: "individual" | "legal_entity";
    phone: string | null;
    legalAddress: string;
    individual?: {
      inn: string | null;
      companyName: string | null;
      ogrnip: string | null;
    };
    legalEntity?: {
      inn: string | null;
      companyName: string | null;
      kpp: string | null;
      ogrn: string | null;
    };
  } | null;
};

// Подключение к базе данных
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "albumen_development",
});

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
          throw new Error("Email и пароль обязательны");
        }

        try {
          // Получаем пользователя и его клиентские данные
          const [rows] = await pool.query(
            `
            SELECT 
              u.id, u.email, u.phone, u.role as roleId, u.password_hash, -- Важно: добавлено password_hash
              r.name AS role_name,
              c.id AS clientId, c.type AS client_type, c.phone AS client_phone, c.legal_address,
              i.inn AS individual_inn, i.company_name AS individual_company, i.ogrnip AS individual_ogrnip,
              l.inn AS legal_inn, l.company_name AS legal_company, l.kpp AS legal_kpp, l.ogrn AS legal_ogrn
            FROM users u
            LEFT JOIN roles r ON u.role = r.id
            LEFT JOIN clients c ON u.id = c.user_id
            LEFT JOIN individuals i ON c.id = i.client_id
            LEFT JOIN legal_entities l ON c.id = l.client_id
            WHERE u.email = ?
            `,
            [credentials.email]
          );

          const users = rows as Array<{
            id: number;
            email: string;
            phone: string | null;
            roleId: number;
            role_name: string | null;
            clientId: number | null;
            client_type: string | null;
            client_phone: string | null;
            legal_address: string;
            individual_inn: string | null;
            individual_company: string | null;
            individual_ogrnip: string | null;
            legal_inn: string | null;
            legal_company: string | null;
            legal_kpp: string | null;
            legal_ogrn: string | null;
            password_hash: string; // Добавлено поле
          }>;

          if (users.length === 0) {
            throw new Error("Пользователь не найден");
          }

          const user = users[0];

          // Проверяем существование password_hash
          if (!user.password_hash) {
            throw new Error("Пароль пользователя не установлен");
          }

          // Сравниваем пароль
          const isValid = await bcrypt.compare(credentials.password, user.password_hash);
          if (!isValid) {
            throw new Error("Неверный пароль");
          }

          // Формируем данные пользователя с клиентскими полями
          const userData: User = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            role: user.role_name || "user",
            client: user.clientId
              ? {
                  id: user.clientId,
                  type: user.client_type as "individual" | "legal_entity",
                  phone: user.client_phone,
                  legalAddress: user.legal_address,
                  ...(user.client_type === "individual"
                    ? {
                        individual: {
                          inn: user.individual_inn,
                          companyName: user.individual_company,
                          ogrnip: user.individual_ogrnip,
                        },
                      }
                    : {
                        legalEntity: {
                          inn: user.legal_inn,
                          companyName: user.legal_company,
                          kpp: user.legal_kpp,
                          ogrn: user.legal_ogrn,
                        },
                      }),
                }
              : null,
          };

          return userData;
        } catch (error) {
          console.error("Ошибка аутентификации:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.client = user.client;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.client = token.client as any;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Экспортируем обработчик
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };