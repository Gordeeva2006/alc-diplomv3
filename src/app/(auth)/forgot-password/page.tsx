'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleCheckEmail = async () => {
    if (!email) return

    try {
      const res = await fetch('/api/checkemail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (res.status === 404) {
        setMessage('Пользователь с таким email не найден')
        return false
      }

      return true
    } catch (error) {
      console.error('Ошибка проверки email:', error)
      setMessage('Произошла сетевая ошибка')
      return false
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    const isValidEmail = await handleCheckEmail()
    if (!isValidEmail) {
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/forgotpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (res.ok) {
        setMessage('Новый пароль отправлен на ваш email')
        setTimeout(() => router.push('/login'), 3000)
      } else {
        setMessage('Ошибка при восстановлении пароля')
      }
    } catch (error) {
      console.error(error)
      setMessage('Произошла сетевая ошибка')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <div className="container mx-auto py-48 max-w-7xl flex-grow">
        <div className="w-full max-w-md mx-auto rounded-lg bg-dark p-8 shadow-md">
          <h1 className="mb-6 text-2xl font-bold text-center">Восстановление пароля</h1>
          
          

          <form onSubmit={handleSubmit} className="space-y-2">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-accent">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#C09D6A] focus:ring-[#C09D6A]"
                placeholder="example@example.com"
              />
            </div>
            {message && (
              <div className="mb-4 rounded-md  p-4 text-red-600">
                {message}
              </div>
            )}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-accent px-4 py-2 text-white hover:bg-[#C09D6A] focus:outline-none focus:ring-2 focus:ring-[#C09D6A] focus:ring-offset-2 disabled:opacity-50"
            >
              {isLoading ? 'Отправка...' : 'Сбросить пароль'}
            </button>
          </form>

          <div className="mt-2 text-center">
            <Link href="/login" className="text-sm text-accent hover:underline">
              Войти
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>

  )
}