"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"
import Link from "next/link"

interface CartItem {
  product_id: number
  product_name: string
  packaging_type_id: number | null
  packaging_name: string | null
  volume: number | null
  unit: string | null
  quantity: number
  unit_price: number
}

interface OrderData {
  order: {
    id: number
    total_amount: number
    status: string
    created_at: string
    legal_address: string
  }
  items: CartItem[]
}

export default function OrderSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState<OrderData["order"] | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrderData() {
      // Извлечение ID из URL
      const orderIdStr = searchParams.get("id")
      if (!orderIdStr) {
        setError("ID заказа не указан")
        setLoading(false)
        return
      }

      const orderId = parseInt(orderIdStr)
      if (isNaN(orderId)) {
        setError("Неверный формат ID заказа")
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`/api/order/${orderId}`)

        if (res.status === 400) {
          setError("Неверный формат ID заказа")
        } else if (res.status === 403) {
          setError("Доступ запрещён: вы не являетесь владельцем этого заказа")
        } else if (res.status === 404) {
          setError("Заказ не найден")
        } else if (!res.ok) {
          setError("Не удалось загрузить данные заказа")
        } else {
          const data = await res.json()
          setOrder(data.order)
          setItems(data.items)
        }
      } catch (err) {
        console.error("Ошибка при загрузке заказа:", err)
        setError("Произошла ошибка при загрузке данных")
      } finally {
        setLoading(false)
      }
    }

    fetchOrderData()
  }, [searchParams])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Загрузка данных заказа...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-100 text-red-800 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Ошибка</h2>
          <p className="mb-4">{error}</p>
          <Link href="/cart" className="text-blue-600 underline hover:text-blue-800">
            Вернуться в корзину
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow p-6 md:p-10 max-w-4xl mx-auto">
        <div className="bg-dark p-6 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold mb-6">✅ Заказ оформлен успешно</h1>

          <div className="mb-6">
            <p><strong>Номер заказа:</strong> {order?.id}</p>
            <p><strong>Дата:</strong> {new Date(order?.created_at).toLocaleString()}</p>
            <p><strong>Юридический адрес:</strong> {order?.legal_address}</p>
          </div>

          <h2 className="text-xl mb-4">Товары в заказе</h2>
          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-[var(--color-gray)]">
                <th className="py-3 text-left">Товар</th>
                <th className="py-3 text-left">Упаковка</th>
                <th className="py-3 text-left">Кол-во</th>
                <th className="py-3 text-left">Цена за ед.</th>
                <th className="py-3 text-left">Итого</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-[var(--color-gray)]">
                  <td className="py-3">{item.product_name}</td>
                  <td className="py-3">{item.packaging_name || "Не указана"}</td>
                  <td className="py-3">{item.quantity}</td>
                  <td className="py-3">{item.unit_price.toFixed(2)} ₽</td>
                  <td className="py-3 font-bold">{(item.unit_price * item.quantity).toFixed(2)} ₽</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-[var(--color-gray)]">
                <td colSpan={4} className="py-3 text-right">Общая сумма:</td>
                <td className="py-3 font-bold">{order?.total_amount.toFixed(2)} ₽</td>
              </tr>
            </tfoot>
          </table>

          <div className="flex gap-4">
            <Link href="/" className="bg-accent px-6 py-3 rounded hover:bg-accent-dark transition-colors">
              Продолжить покупки
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}