"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from "next-auth/react"
import Header from "@/components/common/Header"
import Footer from "@/components/common/Footer"
import Link from 'next/link'
import { useSession } from "next-auth/react" 

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({ email: '', password: '', form: '' })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { data: session, status } = useSession()

  const validateForm = () => {
    const newErrors = { email: '', password: '', form: '' }
    
    if (!formData.email) {
      newErrors.email = 'Поле email обязательно'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email'
    }
    
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Пароль должен быть не менее 8 символов'
    }
    
    setErrors(newErrors)
    return Object.values(newErrors).every(error => !error)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    setIsLoading(true)
    setErrors(prev => ({ ...prev, form: '' }))
    
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
        callbackUrl: '/profile'
      })

      if (result?.error) {
        setErrors(prev => ({ ...prev, form: 'Неверный email или пароль' }))
        return
      }

      router.push(result?.url || '/profile');
      
    } catch (error) {
      console.error("Login error:", error)
      setErrors(prev => ({ ...prev, form: 'Произошла ошибка при входе' }))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] flex flex-col">
      <Header />
      <div className="flex-grow flex justify-center items-center p-4">
        <div className="bg-dark p-8 rounded-2xl shadow-md w-full max-w-md space-y-6">
          <h2 className="text-3xl font-extrabold text-center text-[var(--color-white)]">
            Вход в личный кабинет
          </h2>
          
          {errors.form && (
            <p className="text-red-500 text-sm text-center">{errors.form}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input 
                type="email"
                placeholder="example@email.ru"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`
                  w-full px-4 py-3 rounded-lg 
                  border border-[var(--color-gray)] 
                  bg-[var(--color-dark-secondary)] 
                  text-[var(--color-white)] 
                  focus:outline-none focus:border-[var(--color-accent)]
                  ${errors.email ? 'border-red-500' : ''}
                `}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            
            <div>
              <input 
                type="password"
                placeholder="Пароль"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`
                  w-full px-4 py-3 rounded-lg 
                  border border-[var(--color-gray)] 
                  bg-[var(--color-dark-secondary)] 
                  text-[var(--color-white)] 
                  focus:outline-none focus:border-[var(--color-accent)]
                  ${errors.password ? 'border-red-500' : ''}
                `}
                disabled={isLoading}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
            
            <button 
              type="submit"
              disabled={isLoading}
              className={`
                w-full bg-[var(--color-accent)] 
                text-[var(--color-white)] 
                py-3 px-6 rounded-lg 
                font-semibold transition-all 
                hover:bg-[var(--color-accent-dark)]
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
            
            <div className="flex justify-between mt-4 text-[var(--color-gray)]">
              <Link href="/forgot-password" className="text-[var(--color-accent)] hover:underline">
                Забыли пароль?
              </Link>
              <Link href="/register" className="text-[var(--color-accent)] hover:underline">
                Регистрация
              </Link>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}