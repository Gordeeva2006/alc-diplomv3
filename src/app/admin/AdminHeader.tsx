'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { MoonIcon, SunIcon, MenuIcon, XIcon } from 'lucide-react';

export default function AdminHeader() {
  const router = useRouter();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Для избегания гидратации на сервере
  useEffect(() => {
    setMounted(true);
    // Проверяем предпочтения пользователя для темной темы
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Здесь можно добавить логику для переключения темы в localStorage
  };

  // Установка темы (требуется реализация в _app.tsx)
  useEffect(() => {
    if (!mounted) return;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode, mounted]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <header className="bg-[var(--color-dark)] shadow-lg border-b border-[var(--color-gray)]">
      {/* Баннер админки */}
      <div className="bg-red-900 text-white text-center py-2 font-bold text-sm md:text-base">
        ВЫ НАХОДИТЕСЬ В АДМИН-ПАНЕЛИ
      </div>

      {/* Основная навигация */}
      <nav className="max-w-7xl mx-auto">
        <div className="flex justify-between h-16">
          {/* Логотип и основное меню */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-[var(--color-accent)]">Админ-панель</span>
            </div>
            
            {/* Десктопное меню */}
            <div className="hidden md:ml-6 md:flex md:space-x-8">
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-[var(--color-accent)] transition-colors duration-200"
              >
                Дашборд
              </Link>
              <Link
                href="/admin/products"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-[var(--color-accent)] transition-colors duration-200"
              >
                Продукция
              </Link>
              <Link
                href="/admin/packings"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-[var(--color-accent)] transition-colors duration-200"
              >
                Упаковки
              </Link>
              <Link
                href="/admin/categories"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-[var(--color-accent)] transition-colors duration-200"
              >
                Категории
              </Link>
              <Link
                href="/admin/users"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-[var(--color-accent)] transition-colors duration-200"
              >
                Пользователи
              </Link>
              <Link
                href="/admin/orders"
                className="inline-flex items-center px-1 pt-1 text-sm font-medium text-white hover:text-[var(--color-accent)] transition-colors duration-200"
              >
                Заявки
              </Link>
            </div>
          </div>

          {/* Действия пользователя */}
          <div className="flex items-center">
            {/* Профиль и выход */}
            {session && (
              <div className="ml-4 relative flex items-center">
                <span className="hidden md:inline-block text-sm text-white mr-4">
                  {session.user?.email} | 
                  {session.user?.role}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-2 px-4 py-2 bg-red-700 text-white rounded-md text-sm font-medium hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
                >
                  Выход
                </button>
              </div>
            )}

            {/* Мобильное меню */}
            <div className="flex md:hidden ml-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-[var(--color-gray)] focus:outline-none"
                aria-expanded="false"
              >
                {isMobileMenuOpen ? (
                  <XIcon className="block h-6 w-6" />
                ) : (
                  <MenuIcon className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Мобильное меню */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                href="/admin/dashboard"
                className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-[var(--color-gray)] hover:text-[var(--color-accent)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Дашборд
              </Link>
              <Link
                href="/admin/products"
                className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-[var(--color-gray)] hover:text-[var(--color-accent)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Продукция
              </Link>
              <Link
                href="/admin/packings"
                className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-[var(--color-gray)] hover:text-[var(--color-accent)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Упаковки
              </Link>
              <Link
                href="/admin/categories"
                className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-[var(--color-gray)] hover:text-[var(--color-accent)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Категории
              </Link>
              <Link
                href="/admin/users"
                className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-[var(--color-gray)] hover:text-[var(--color-accent)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Пользователи
              </Link>
              <Link
                href="/admin/orders"
                className="block pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-[var(--color-gray)] hover:text-[var(--color-accent)]"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                заявки
              </Link>
              
              {session && (
                <button
                  onClick={handleLogout}
                  className="w-full text-left pl-3 pr-4 py-2 text-base font-medium text-white hover:bg-[var(--color-gray)] hover:text-[var(--color-accent)]"
                >
                  Выйти
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}