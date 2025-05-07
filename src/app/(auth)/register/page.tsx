"use client";
import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

interface FormData {
  userType: 'individual' | 'legal_entity';
  companyName: string;
  inn: string;
  ogrn: string;
  ogrnip: string;
  kpp: string;
  legalAddress: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

const RegisterPage = () => {
  const [formData, setFormData] = useState<FormData>({
    userType: 'individual',
    companyName: '',
    inn: '',
    ogrn: '',
    ogrnip: '',
    kpp: '',
    legalAddress: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/;

  const handleTypeChange = (type: 'individual' | 'legal_entity') => {
    setFormData(prev => ({
      ...prev,
      userType: type,
      ...(type === 'legal_entity' ? { ogrnip: '' } : { ogrn: '', kpp: '' })
    }));
    setErrors(prev => ({
      ...prev,
      ogrn: undefined,
      kpp: undefined,
      ogrnip: undefined
    }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Общие проверки
    if (!formData.email) newErrors.email = 'Email обязателен';
    if (!formData.password) newErrors.password = 'Пароль обязателен';
    if (!formData.phone) newErrors.phone = 'Телефон обязателен';
    if (!formData.inn) newErrors.inn = 'ИНН обязателен';
    if (!formData.companyName) newErrors.companyName = 'Название компании обязательно';
    if (!formData.legalAddress) newErrors.legalAddress = 'Юридический адрес обязателен';

    // Проверка email формата
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }

    // Проверка пароля
    if (formData.password && !strongPasswordRegex.test(formData.password)) {
      newErrors.password = 'Пароль должен содержать: минимум 9 символов, заглавные/строчные латинские буквы, цифры и спецсимволы';
    }

    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }

    // Для юридических лиц
    if (formData.userType === 'legal_entity') {
      if (!formData.ogrn) newErrors.ogrn = 'ОГРН обязателен';
      if (!formData.kpp) newErrors.kpp = 'КПП обязателен';
    }

    // Для ИП
    if (formData.userType === 'individual') {
      if (!formData.ogrnip) newErrors.ogrnip = 'ОГРНИП обязателен';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: formData.phone.replace(/\D/g, '') // Очистка номера телефона
        })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Ошибка регистрации');
      }

      window.location.href = '/login'; // Перенаправление на страницу входа

    } catch (error: any) {
      setErrors(prev => ({ ...prev, form: error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex justify-center items-center p-4">
        <div className="bg-dark p-8 rounded-lg shadow-md w-full max-w-lg space-y-6 my-20">
          <h2 className="text-2xl font-bold text-center text-white">
            Регистрация
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Тип пользователя */}
            <div>
              <select 
                value={formData.userType}
                onChange={(e) => handleTypeChange(e.target.value as 'individual' | 'legal_entity')}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              >
                <option value="individual">Индивидуальный предприниматель</option>
                <option value="legal_entity">Юридическое лицо</option>
              </select>
            </div>

            {/* Поля для юридических лиц */}
            {formData.userType === 'legal_entity' && (
              <>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="ОГРН (13 цифр)"
                    value={formData.ogrn}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      ogrn: e.target.value.replace(/\D/g, '').slice(0, 13) 
                    })}
                    className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                  {errors.ogrn && <p className="text-red-500 text-sm mt-1">{errors.ogrn}</p>}
                </div>
                <div className="relative">
                  <input 
                    type="text"
                    placeholder="КПП (9 цифр)"
                    value={formData.kpp}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      kpp: e.target.value.replace(/\D/g, '').slice(0, 9) 
                    })}
                    className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                  />
                  {errors.kpp && <p className="text-red-500 text-sm mt-1">{errors.kpp}</p>}
                </div>
              </>
            )}

            {/* Общие поля */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Название компании"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
              {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
            </div>
            <div className="relative">
              <input 
                type="tel"
                placeholder="Номер телефона"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div className="relative">
              <input 
                type="text"
                placeholder="ИНН (10 цифр)"
                value={formData.inn}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  inn: e.target.value.replace(/\D/g, '').slice(0, 10) 
                })}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
              {errors.inn && <p className="text-red-500 text-sm mt-1">{errors.inn}</p>}
            </div>

            {/* Поля для ИП */}
            {formData.userType === 'individual' && (
              <div className="relative">
                <input 
                  type="text"
                  placeholder="ОГРНИП (15 цифр)"
                  value={formData.ogrnip}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    ogrnip: e.target.value.replace(/\D/g, '').slice(0, 15) 
                  })}
                  className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                />
                {errors.ogrnip && <p className="text-red-500 text-sm mt-1">{errors.ogrnip}</p>}
              </div>
            )}

            {/* Юридический адрес */}
            <div className="relative">
              <input 
                type="text"
                placeholder="Юридический адрес"
                value={formData.legalAddress}
                onChange={(e) => setFormData({ ...formData, legalAddress: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
              {errors.legalAddress && <p className="text-red-500 text-sm mt-1">{errors.legalAddress}</p>}
            </div>

            {/* Email */}
            <div className="relative">
              <input 
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>

            {/* Пароль */}
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                placeholder="Пароль"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)] pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray)] hover:text-[var(--color-accent)]"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7-1.926 7-9.542 7-9.542-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L9.88 9.88m0 0l-.707.707M15.12 15.12l.707-.707M16.5 7.5v6m-3 0h3" />
                  </svg>
                )}
              </button>
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>

            {/* Подтверждение пароля */}
            <div className="relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Подтвердите пароль"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)] pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-gray)] hover:text-[var(--color-accent)]"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
              >
                {showConfirmPassword ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7-1.926 7-9.542 7-9.542-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L9.88 9.88m0 0l-.707.707M15.12 15.12l.707-.707M16.5 7.5v6m-3 0h3" />
                  </svg>
                )}
              </button>
              {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Кнопка регистрации */}
            <button 
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[var(--color-accent)] text-white py-2 px-4 rounded transition focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-opacity-50 ${
                isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-90'
              }`}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>

            {/* Ссылка на вход */}
            <div className="mt-4 text-center text-[var(--color-gray)]">
              Уже есть аккаунт?{' '}
              <Link href="/auth/login" className="text-[var(--color-accent)] hover:underline">
                Войти
              </Link>
            </div>

            {/* Глобальная ошибка */}
            {errors.form && <p className="text-red-500 text-sm text-center">{errors.form}</p>}
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default RegisterPage;