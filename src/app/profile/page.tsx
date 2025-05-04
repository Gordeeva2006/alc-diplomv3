"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"
import { CartProvider } from "@/components/CartProvider"

// Типы данных (остаются без изменений)
interface IndividualData {
  inn?: string | null
  companyName?: string | null
  ogrnip?: string | null
}
interface LegalEntityData {
  inn?: string | null
  companyName?: string | null
  kpp?: string | null
  ogrn?: string | null
}
interface ClientData {
  id: number
  phone?: string | null
  legalAddress?: string | null
  type: "individual" | "legal_entity"
  individual?: IndividualData
  legalEntity?: LegalEntityData
}
interface UserData {
  id: string
  email: string
  phone?: string | null
  role?: string
  client?: ClientData
}

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()
  const [saving, setSaving] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  
  // Состояния формы (остаются без изменений)
  const [email, setEmail] = useState("")
  const [userPhone, setUserPhone] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [legalAddress, setLegalAddress] = useState("")
  const [clientType, setClientType] = useState<"individual" | "legal_entity">("individual")
  const [indInn, setIndInn] = useState("")
  const [indCompany, setIndCompany] = useState("")
  const [indOgrnip, setIndOgrnip] = useState("")
  const [leInn, setLeInn] = useState("")
  const [leCompany, setLeCompany] = useState("")
  const [leKpp, setLeKpp] = useState("")
  const [leOgrn, setLeOgrn] = useState("")
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Загрузка данных из сессии (остается без изменений)
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const userData = session.user as UserData
      setEmail(userData.email || "")
      setUserPhone(userData.phone || "")
      if (userData.client) {
        setClientPhone(userData.client.phone || "")
        setLegalAddress(userData.client.legalAddress || "")
        setClientType(userData.client.type)
        if (userData.client.type === "individual" && userData.client.individual) {
          setIndInn(userData.client.individual.inn || "")
          setIndCompany(userData.client.individual.companyName || "")
          setIndOgrnip(userData.client.individual.ogrnip || "")
        }
        if (userData.client.type === "legal_entity" && userData.client.legalEntity) {
          setLeInn(userData.client.legalEntity.inn || "")
          setLeCompany(userData.client.legalEntity.companyName || "")
          setLeKpp(userData.client.legalEntity.kpp || "")
          setLeOgrn(userData.client.legalEntity.ogrn || "")
        }
      }
    }
  }, [status, session])

  // Валидация полей (остается без изменений)
  const validateFields = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!email.trim()) newErrors.email = "Email обязателен"
    if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Неверный формат email"
    if (oldPassword || newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        newErrors.password = "Пароли не совпадают"
      }
      if (newPassword && newPassword.length < 8) {
        newErrors.password = "Пароль должен быть не менее 8 символов"
      }
    }
    if (clientType === "individual") {
      if (indInn && indInn.length !== 12) {
        newErrors.indInn = "ИНН должен содержать 12 цифр"
      }
      if (indOgrnip && indOgrnip.length !== 15) {
        newErrors.indOgrnip = "ОГРНИП должен содержать 15 цифр"
      }
    } else if (clientType === "legal_entity") {
      if (leInn && leInn.length !== 10) {
        newErrors.leInn = "ИНН должен содержать 10 цифр"
      }
      if (leKpp && leKpp.length !== 9) {
        newErrors.leKpp = "КПП должен содержать 9 цифр"
      }
      if (leOgrn && leOgrn.length !== 13) {
        newErrors.leOgrn = "ОГРН должен содержать 13 цифр"
      }
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Сохранение профиля (остается без изменений)
  const handleSave = async () => {
    if (!validateFields()) return
    setSaving(true)
    try {
      const response = await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          phone: userPhone,
          client: {
            phone: clientPhone,
            legalAddress,
            type: clientType,
            ...(clientType === "individual" && {
              individual: {
                inn: indInn || "",
                companyName: indCompany || "",
                ogrnip: indOgrnip || ""
              }
            }),
            ...(clientType === "legal_entity" && {
              legalEntity: {
                inn: leInn || "",
                companyName: leCompany || "",
                kpp: leKpp || "",
                ogrn: leOgrn || ""
              }
            })
          }
        })
      })
      if (!response.ok) throw new Error("Ошибка сохранения данных")
      await update()
      alert("Данные успешно обновлены")
    } catch (error: any) {
      console.error("Ошибка сохранения:", error)
      alert(`Ошибка: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  // Изменение пароля (остается без изменений)
  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("Заполните все поля")
      return
    }
    if (newPassword !== confirmPassword) {
      alert("Пароли не совпадают")
      return
    }
    setPasswordLoading(true)
    try {
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      })
      if (!response.ok) throw new Error("Ошибка изменения пароля")
      alert("Пароль успешно изменён")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      alert(`Ошибка: ${error.message}`)
    } finally {
      setPasswordLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-dark)] text-white">
        <p>Загрузка профиля...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-dark)] text-white">
      <CartProvider>
        <Header />
      </CartProvider>
      <main className="flex-grow p-4 md:p-8 w-full">
        <div className="bg-[var(--color-dark)] p-6 rounded-lg shadow-lg max-w-7xl mx-auto">
          {/* Заголовок */}
          <h2 className="text-2xl font-bold mb-8 text-[var(--color-accent)] border-b border-[var(--color-gray)] pb-4">
            Профиль пользователя
          </h2>

          {/* Основная информация */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                  errors.email ? "border border-[var(--color-error)]" : ""
                }`}
              />
              {errors.email && <p className="text-[var(--color-error)] text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Телефон пользователя</label>
              <input
                type="tel"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
              />
            </div>
          </div>

          {/* Тип клиента */}
          <div className="mb-8">
            <label className="block mb-3 text-sm font-medium text-gray-300">Тип клиента</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setClientType("individual")}
                className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                  clientType === "individual" 
                    ? "bg-[var(--color-accent)] text-[var(--color-dark)] shadow-md" 
                    : "bg-[var(--color-gray)] hover:bg-gray-600 text-white"
                }`}
              >
                Физическое лицо
              </button>
              <button
                type="button"
                onClick={() => setClientType("legal_entity")}
                className={`px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                  clientType === "legal_entity" 
                    ? "bg-[var(--color-accent)] text-[var(--color-dark)] shadow-md" 
                    : "bg-[var(--color-gray)] hover:bg-gray-600 text-white"
                }`}
              >
                Юрлицо
              </button>
            </div>
          </div>

          {/* Общие данные клиента */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Телефон организации</label>
              <input
                type="tel"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                className="w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-300">Юридический адрес</label>
              <input
                type="text"
                value={legalAddress}
                onChange={(e) => setLegalAddress(e.target.value)}
                className="w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
              />
            </div>
          </div>

          {/* Условные поля по типу клиента */}
          {clientType === "individual" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">ИНН</label>
                  <input
                    type="text"
                    value={indInn}
                    onChange={(e) => setIndInn(e.target.value)}
                    placeholder="12 цифр"
                    className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                      errors.indInn ? "border border-[var(--color-error)]" : ""
                    }`}
                  />
                  {errors.indInn && <p className="text-[var(--color-error)] text-sm mt-1">{errors.indInn}</p>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Компания</label>
                  <input
                    type="text"
                    value={indCompany}
                    onChange={(e) => setIndCompany(e.target.value)}
                    className="w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                  />
                </div>
              </div>
              <div className="mb-8">
                <label className="block mb-2 text-sm font-medium text-gray-300">ОГРНИП</label>
                <input
                  type="text"
                  value={indOgrnip}
                  onChange={(e) => setIndOgrnip(e.target.value)}
                  placeholder="15 цифр"
                  className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                    errors.indOgrnip ? "border border-[var(--color-error)]" : ""
                  }`}
                />
                {errors.indOgrnip && <p className="text-[var(--color-error)] text-sm mt-1">{errors.indOgrnip}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">ИНН</label>
                  <input
                    type="text"
                    value={leInn}
                    onChange={(e) => setLeInn(e.target.value)}
                    placeholder="10 цифр"
                    className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                      errors.leInn ? "border border-[var(--color-error)]" : ""
                    }`}
                  />
                  {errors.leInn && <p className="text-[var(--color-error)] text-sm mt-1">{errors.leInn}</p>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">Компания</label>
                  <input
                    type="text"
                    value={leCompany}
                    onChange={(e) => setLeCompany(e.target.value)}
                    className="w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">КПП</label>
                  <input
                    type="text"
                    value={leKpp}
                    onChange={(e) => setLeKpp(e.target.value)}
                    placeholder="9 цифр"
                    className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                      errors.leKpp ? "border border-[var(--color-error)]" : ""
                    }`}
                  />
                  {errors.leKpp && <p className="text-[var(--color-error)] text-sm mt-1">{errors.leKpp}</p>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium text-gray-300">ОГРН</label>
                  <input
                    type="text"
                    value={leOgrn}
                    onChange={(e) => setLeOgrn(e.target.value)}
                    placeholder="13 цифр"
                    className={`w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all ${
                      errors.leOgrn ? "border border-[var(--color-error)]" : ""
                    }`}
                  />
                  {errors.leOgrn && <p className="text-[var(--color-error)] text-sm mt-1">{errors.leOgrn}</p>}
                </div>
              </div>
            </>
          )}

          {/* Изменение пароля */}
          <div className="border-t border-[var(--color-gray)] pt-8 mt-8">
            <h3 className="font-bold mb-6 text-lg text-[var(--color-accent)]">Изменить пароль</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Старый пароль</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Новый пароль</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-300">Подтвердите пароль</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[var(--color-gray)] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                />
              </div>
            </div>
            {errors.password && <p className="text-[var(--color-error)] text-sm mb-6">{errors.password}</p>}
            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="bg-[var(--color-accent)] hover:bg-opacity-90 text-[var(--color-dark)] px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? "Сохранение..." : "Сохранить пароль"}
            </button>
          </div>

          {/* Кнопки управления */}
          <div className="mt-12 flex flex-wrap gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[var(--color-accent)] hover:bg-opacity-90 text-[var(--color-dark)] px-8 py-3 rounded-lg font-medium flex-1 min-w-[160px] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Сохранение..." : "Сохранить изменения"}
            </button>
            <button
              onClick={() => signOut()}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Выйти
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}