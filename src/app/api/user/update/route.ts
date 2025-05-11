// src/app/api/user/update/route.ts

import { NextRequest } from "next/server";
import { pool } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { RowDataPacket, ResultSetHeader } from "mysql2/promise";

const LOG_PREFIX = "[PROFILE_API]";

// Валидационные правила
const VALIDATION_RULES = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: "Неверный формат email"
  },
  phone: {
    regex: /^\+7\d{10}$/,
    message: "Телефон должен быть в формате +7XXXXXXXXXX"
  },
  inn: {
    individual: { length: 12, message: "ИНН физического лица должен содержать 12 цифр" },
    legal: { length: 10, message: "ИНН юридического лица должен содержать 10 цифр" }
  },
  ogrnip: {
    length: 15,
    message: "ОГРНИП должен содержать 15 цифр"
  },
  kpp: {
    length: 9,
    message: "КПП должен содержать 9 цифр"
  },
  ogrn: {
    length: 13,
    message: "ОГРН должен содержать 13 цифр"
  },
  address: {
    minLength: 5,
    message: "Адрес должен содержать не менее 5 символов"
  }
};

// Типы данных
interface UpdateData {
  email: string;
  phone?: string | null;
  client: {
    id?: number;
    phone?: string | null;
    legalAddress: string;
    type: "individual" | "legal_entity";
    individual?: IndividualData;
    legalEntity?: LegalEntityData;
  };
}

interface IndividualData {
  inn: string;
  companyName: string;
  ogrnip: string;
}

interface LegalEntityData {
  inn: string;
  companyName: string;
  kpp: string;
  ogrn: string;
}

// Валидация email
function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email обязателен";
  if (!VALIDATION_RULES.email.regex.test(email)) return VALIDATION_RULES.email.message;
  return null;
}

// Валидация телефона
function validatePhone(phone: string | undefined): string | null {
  if (!phone) return null;
  if (!VALIDATION_RULES.phone.regex.test(phone)) return VALIDATION_RULES.phone.message;
  return null;
}

// Валидация данных ИП
function validateIndividualData(data: IndividualData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.inn) {
    errors.inn = "ИНН обязателен";
  } else if (data.inn.length !== VALIDATION_RULES.inn.individual.length) {
    errors.inn = VALIDATION_RULES.inn.individual.message;
  }
  if (!data.companyName.trim()) {
    errors.companyName = "Название компании обязательна";
  }
  if (!data.ogrnip) {
    errors.ogrnip = "ОГРНИП обязателен";
  } else if (data.ogrnip.length !== VALIDATION_RULES.ogrnip.length) {
    errors.ogrnip = VALIDATION_RULES.ogrnip.message;
  }
  return errors;
}

// Валидация данных юрлица
function validateLegalEntityData(data: LegalEntityData): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!data.inn) {
    errors.inn = "ИНН обязателен";
  } else if (data.inn.length !== VALIDATION_RULES.inn.legal.length) {
    errors.inn = VALIDATION_RULES.inn.legal.message;
  }
  if (!data.companyName.trim()) {
    errors.companyName = "Название компании обязательна";
  }
  if (!data.kpp) {
    errors.kpp = "КПП обязателен";
  } else if (data.kpp.length !== VALIDATION_RULES.kpp.length) {
    errors.kpp = VALIDATION_RULES.kpp.message;
  }
  if (!data.ogrn) {
    errors.ogrn = "ОГРН обязателен";
  } else if (data.ogrn.length !== VALIDATION_RULES.ogrn.length) {
    errors.ogrn = VALIDATION_RULES.ogrn.message;
  }
  return errors;
}

// Валидация юридического адреса
function validateLegalAddress(address: string): string | null {
  if (!address.trim()) return "Юридический адрес обязателен";
  if (address.length < VALIDATION_RULES.address.minLength) {
    return VALIDATION_RULES.address.message;
  }
  return null;
}

// Основная валидация
function validateUpdateData(data: any): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  const emailError = validateEmail(data.email);
  if (emailError) errors.email = emailError;
  const userPhoneError = validatePhone(data.phone);
  if (userPhoneError) errors.userPhone = userPhoneError;
  if (!data.client) {
    errors.client = "Данные клиента обязательны";
    return { valid: false, errors };
  }
  const clientPhoneError = validatePhone(data.client.phone);
  if (clientPhoneError) errors.clientPhone = clientPhoneError;
  const legalAddressError = validateLegalAddress(data.client.legalAddress);
  if (legalAddressError) errors.legalAddress = legalAddressError;
  if (data.client.type === "individual") {
    if (!data.client.individual) {
      errors.individual = "Данные ИП обязательны";
    } else {
      const individualErrors = validateIndividualData(data.client.individual);
      Object.entries(individualErrors).forEach(([key, value]) => {
        errors[`individual.${key}`] = value;
      });
    }
  } else if (data.client.type === "legal_entity") {
    if (!data.client.legalEntity) {
      errors.legalEntity = "Данные юрлица обязательны";
    } else {
      const legalEntityErrors = validateLegalEntityData(data.client.legalEntity);
      Object.entries(legalEntityErrors).forEach(([key, value]) => {
        errors[`legalEntity.${key}`] = value;
      });
    }
  } else {
    errors.type = "Неверный тип клиента";
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

// Получение данных пользователя
export async function GET(req: NextRequest) {
  const start = Date.now();
  const method = req.method;
  const url = req.url;
  console.info(`${LOG_PREFIX} [START] ${method} ${url}`);
  try {
    const session = await getServerSession(authOptions);
    console.info(`${LOG_PREFIX} [SESSION]`, session?.user ? "authenticated" : "unauthenticated");
    if (!session?.user) {
      console.warn(`${LOG_PREFIX} [UNAUTHORIZED]`);
      return new Response(JSON.stringify({ error: "Неавторизован" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = parseInt(session.user.id);
    console.info(`${LOG_PREFIX} [USER_ID]`, userId);

    const [userRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, email, phone, role FROM users WHERE id = ?",
      [userId]
    );
    const user = userRows[0];
    if (!user) {
      console.warn(`${LOG_PREFIX} [USER_NOT_FOUND]`, { userId });
      return new Response(JSON.stringify({ error: "Пользователь не найден" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const [clientRows] = await pool.query<RowDataPacket[]>(
      "SELECT id, phone, legal_address, type FROM clients WHERE user_id = ?",
      [userId]
    );
    const client = clientRows[0];
    let individual = null;
    let legalEntity = null;

    if (client) {
      if (client.type === "individual") {
        const [indRows] = await pool.query<RowDataPacket[]>(
          "SELECT inn, company_name, ogrnip FROM individuals WHERE client_id = ?",
          [client.id]
        );
        individual = indRows[0] || null;
      } else if (client.type === "legal_entity") {
        const [leRows] = await pool.query<RowDataPacket[]>(
          "SELECT inn, company_name, kpp, ogrn FROM legal_entities WHERE client_id = ?",
          [client.id]
        );
        legalEntity = leRows[0] || null;
      }
    }

    const response = {
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      client: client
        ? {
            id: client.id,
            phone: client.phone,
            legalAddress: client.legal_address,
            type: client.type,
            individual,
            legalEntity
          }
        : null
    };

    console.info(`${LOG_PREFIX} [SUCCESS] GET`, { duration: Date.now() - start, response });
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} [ERROR] GET`, { error, stack: (error as Error).stack });
    return new Response(JSON.stringify({ error: "Ошибка сервера" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// Обновление данных пользователя
export async function PUT(req: NextRequest) {
  const start = Date.now();
  const method = req.method;
  const url = req.url;
  console.info(`${LOG_PREFIX} [START] ${method} ${url}`);
  try {
    const session = await getServerSession(authOptions);
    console.info(`${LOG_PREFIX} [SESSION]`, session?.user ? "authenticated" : "unauthenticated");
    if (!session?.user) {
      console.warn(`${LOG_PREFIX} [UNAUTHORIZED]`);
      return new Response(JSON.stringify({ error: "Неавторизован" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    const userId = parseInt(session.user.id);
    console.info(`${LOG_PREFIX} [USER_ID]`, userId);

    let data: any;
    try {
      data = await req.json();
      console.info(`${LOG_PREFIX} [REQUEST_BODY]`, data);
    } catch (error) {
      console.warn(`${LOG_PREFIX} [INVALID_JSON]`, error);
      return new Response(JSON.stringify({ error: "Неверный формат данных" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const validation = validateUpdateData(data);
    if (!validation.valid) {
      console.warn(`${LOG_PREFIX} [VALIDATION_FAILED]`, validation.errors);
      return new Response(JSON.stringify({ errors: validation.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const connection = await pool.getConnection();
    console.info(`${LOG_PREFIX} [DB_TRANSACTION_STARTED]`);
    try {
      await connection.beginTransaction();

      // Обновление пользователя
      await connection.query(
        "UPDATE users SET email = ?, phone = ? WHERE id = ?",
        [data.email, data.phone, userId]
      );

      const [existingClientRows] = await connection.query<RowDataPacket[]>(
        "SELECT id, type FROM clients WHERE user_id = ?",
        [userId]
      );
      const existingClient = existingClientRows[0];
      let clientId: number;

      if (existingClient) {
        await connection.query(
          "UPDATE clients SET phone = ?, legal_address = ?, type = ? WHERE id = ?",
          [data.client.phone, data.client.legalAddress, data.client.type, existingClient.id]
        );
        clientId = existingClient.id;

        if (data.client.type === "individual") {
          if (existingClient.type !== "individual") {
            await connection.query("DELETE FROM legal_entities WHERE client_id = ?", [existingClient.id]);
          }
          await connection.query(
            "INSERT INTO individuals (client_id, inn, company_name, ogrnip) VALUES (?, ?, ?, ?) " +
            "ON DUPLICATE KEY UPDATE inn = ?, company_name = ?, ogrnip = ?",
            [
              existingClient.id,
              data.client.individual.inn,
              data.client.individual.companyName,
              data.client.individual.ogrnip,
              data.client.individual.inn,
              data.client.individual.companyName,
              data.client.individual.ogrnip
            ]
          );
        } else if (data.client.type === "legal_entity") {
          if (existingClient.type !== "legal_entity") {
            await connection.query("DELETE FROM individuals WHERE client_id = ?", [existingClient.id]);
          }
          await connection.query(
            "INSERT INTO legal_entities (client_id, inn, company_name, kpp, ogrn) VALUES (?, ?, ?, ?, ?) " +
            "ON DUPLICATE KEY UPDATE inn = ?, company_name = ?, kpp = ?, ogrn = ?",
            [
              existingClient.id,
              data.client.legalEntity.inn,
              data.client.legalEntity.companyName,
              data.client.legalEntity.kpp,
              data.client.legalEntity.ogrn,
              data.client.legalEntity.inn,
              data.client.legalEntity.companyName,
              data.client.legalEntity.kpp,
              data.client.legalEntity.ogrn
            ]
          );
        }
      } else {
        const [clientResult] = await connection.query<ResultSetHeader>(
          "INSERT INTO clients (user_id, phone, legal_address, type) VALUES (?, ?, ?, ?)",
          [userId, data.client.phone, data.client.legalAddress, data.client.type]
        );
        clientId = clientResult.insertId;

        if (data.client.type === "individual") {
          await connection.query(
            "INSERT INTO individuals (client_id, inn, company_name, ogrnip) VALUES (?, ?, ?, ?)",
            [
              clientId,
              data.client.individual.inn,
              data.client.individual.companyName,
              data.client.individual.ogrnip
            ]
          );
        } else if (data.client.type === "legal_entity") {
          await connection.query(
            "INSERT INTO legal_entities (client_id, inn, company_name, kpp, ogrn) VALUES (?, ?, ?, ?, ?)",
            [
              clientId,
              data.client.legalEntity.inn,
              data.client.legalEntity.companyName,
              data.client.legalEntity.kpp,
              data.client.legalEntity.ogrn
            ]
          );
        }
      }

      await connection.commit();
      console.info(`${LOG_PREFIX} [TRANSACTION_COMMITTED]`, { duration: Date.now() - start });
    } catch (error) {
      await connection.rollback();
      console.error(`${LOG_PREFIX} [TRANSACTION_ROLLED_BACK]`, { error, stack: (error as Error).stack });
      throw error;
    } finally {
      connection.release();
      console.info(`${LOG_PREFIX} [DB_CONNECTION_RELEASED]`);
    }

    console.info(`${LOG_PREFIX} [SUCCESS] PUT`, { duration: Date.now() - start });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error(`${LOG_PREFIX} [ERROR] PUT`, { error, stack: (error as Error).stack });
    if (error instanceof Error && error.message.includes("Duplicate entry")) {
      return new Response(JSON.stringify({ error: "Этот email уже используется" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ error: "Ошибка сервера" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}