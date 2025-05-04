"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  FaUser, 
  FaBox, 
  FaListUl, 
  FaShoppingCart, 
  FaBars, 
  FaSignOutAlt,
  FaSignInAlt
} from "react-icons/fa";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { HEADER_LINKS } from "@/app/config";

interface MenuItem {
  icon: string;
  text: string;
  href: string;
}

export default function Header() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const getIconForMenuItem = (iconName: string) => {
    switch (iconName) {
      case "FaUser":
        return <FaUser />;
      case "FaBox":
        return <FaBox />;
      case "FaListUl":
        return <FaListUl />;
      default:
        return null;
    }
  };

  const filteredMenuItems = HEADER_LINKS.menuItems.filter((item: MenuItem) => {
    if (item.text === "Профиль") {
      return status === "authenticated";
    }
    return true;
  });

  const handleMenuItemClick = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAuthAction = () => {
    if (status === "authenticated") {
      signOut({ callbackUrl: HEADER_LINKS.home });
    } 
  };

  return (
    <div>
      {/* Шапка сайта */}
      <header className="bg-dark fixed top-0 left-0 right-0 z-50 shadow-lg">
        {/* Верхняя панель */}
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4">
          {/* Логотип */}
          <Link href={HEADER_LINKS.home} className="flex items-center">
            <img 
              src='images/alc-logo.svg'
              alt="Логотип" 
              className="h-8 w-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </Link>

          {/* Навигация для десктопа */}
          <nav className="hidden md:flex items-center gap-8">
            {filteredMenuItems.map((item: MenuItem, index: number) => (
              <Link
                key={index}
                href={item.href}
                className="flex items-center gap-2 text-white hover:text-[var(--color-accent)] transition-colors group"
              >
                <span className="text-xl group-hover:text-[var(--color-accent)] transition-colors">
                  {getIconForMenuItem(item.icon)}
                </span>
                <span className="hidden md:inline">{item.text}</span>
              </Link>
            ))}
          </nav>

          {/* Правая часть для десктопа */}
          <div className="hidden md:flex items-center gap-4">
            {/* Ссылка на корзину */}
            <Link 
              href={HEADER_LINKS.cart} 
              className="relative p-2 rounded-full hover:bg-gray-800 transition-colors"
            >
              <FaShoppingCart className="text-2xl text-white hover:text-[var(--color-accent)] transition-colors" />
              <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                0
              </span>
            </Link>

            {/* Только кнопка входа/выхода без аватарки */}
            {status === "authenticated" ? (
              <button
                onClick={handleAuthAction}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt className="text-lg" />
                <span className="hidden md:inline">Выход</span>
              </button>
            ) : (
              <button
                onClick={handleAuthAction}
                className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-white rounded hover:bg-opacity-90 transition-colors"
              >
                <FaSignInAlt className="text-lg" />
                <span className="hidden md:inline"> <a href="/login">Войти</a></span>
              </button>
            )}
          </div>

          {/* Бургер-меню для мобильных */}
          <div className="md:hidden flex items-center gap-4">
            <Link 
              href={HEADER_LINKS.cart} 
              className="relative p-2"
            >
              <FaShoppingCart className="text-2xl text-white hover:text-[var(--color-accent)] transition-colors" />
              <span className="absolute -top-1 -right-1 bg-[var(--color-accent)] text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                0
              </span>
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white text-2xl focus:outline-none"
              aria-expanded={isMobileMenuOpen}
              aria-label="Открыть меню"
            >
              <FaBars />
            </button>
          </div>
        </div>

        {/* Мобильное меню */}
        <div
          className={`md:hidden bg-[var(--color-dark)] transition-transform duration-300 ease-in-out fixed top-16 left-0 right-0 h-[calc(100vh-4rem)] overflow-y-auto transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } z-40`}
        >
          <div className="p-4 space-y-4">
            {/* Основные пункты меню */}
            {filteredMenuItems.map((item: MenuItem, index: number) => (
              <Link
                key={index}
                href={item.href}
                onClick={handleMenuItemClick}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800 transition-colors group"
              >
                <span className="text-xl text-gray-300 group-hover:text-[var(--color-accent)] transition-colors">
                  {getIconForMenuItem(item.icon)}
                </span>
                <span className="text-white text-lg">{item.text}</span>
              </Link>
            ))}

            {/* Разделитель */}
            <div className="border-t border-gray-800 my-2"></div>

            {/* Только кнопка входа/выхода без аватарки */}
            {status === "authenticated" ? (
              <button
                onClick={handleAuthAction}
                className="w-full flex items-center gap-4 p-3 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                <FaSignOutAlt className="text-xl" />
                <span>Выход</span>
              </button>
            ) : (
              <Link
                href="/api/auth/signin"
                onClick={handleMenuItemClick}
                className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <FaSignInAlt className="text-xl text-gray-300" />
                <span className="text-white">Войти</span>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Отступ под фиксированную шапку */}
      <div className="h-16"></div>
    </div>
  );
}