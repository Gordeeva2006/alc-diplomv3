import "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    phone?: string
    role?: string
    client?: {
      id: number
      phone?: string
      legalAddress?: string
      type: "individual" | "legal_entity"
      individual?: {
        inn?: string
        companyName?: string
        ogrnip?: string
      }
      legalEntity?: {
        inn?: string
        companyName?: string
        kpp?: string
        ogrn?: string
      }
    }
  }

  interface Session {
    user: User
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    phone?: string
    role?: string
    client?: {
      id: number
      phone?: string
      legalAddress?: string
      type: "individual" | "legal_entity"
      individual?: {
        inn?: string
        companyName?: string
        ogrnip?: string
      }
      legalEntity?: {
        inn?: string
        companyName?: string
        kpp?: string
        ogrn?: string
      }
    }
  }
}