"use client";

import Link from "next/link";
import { FaBox, FaShoppingCart, FaUserTie, FaUsers } from "react-icons/fa";

const cardData = [
  {
    title: "Заказы",
    description: "Управление всеми заказами компании",
    icon: <FaShoppingCart className="text-xl" />,
    href: "/admin/orders"
  },
  {
    title: "Упаковки",
    description: "Управление упаковочными материалами",
    icon: <FaBox className="text-xl" />,
    href: "/admin/packings"
  },
  {
    title: "Продукты",
    description: "Управление ассортиментом товаров",
    icon: <FaBox className="text-xl" />,
    href: "/admin/products"
  },
  {
    title: "Пользователи",
    description: "Управление сотрудниками и клиентами",
    icon: <FaUsers className="text-xl" />,
    href: "/admin/users"
  }
];

export default function DirectorDashboard() {
  return (
    <div className="min-h-screen bg-[var(--color-white)] p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[var(--color-black)]">Панель управления</h1>
        
        <p className="mb-8 text-[var(--color-gray)]">
          Доступно только директорам. Выберите раздел для управления:
        </p>
        
        <div className="flex flex-wrap -mx-3">
          {cardData.map((card, index) => (
            <div 
              key={index}
              className="w-full md:w-1/2 lg:w-1/4 px-3 mb-6"
            >
              <Link 
                href={card.href}
                className="block h-full focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] rounded-lg transition-transform hover:-translate-y-1"
                aria-label={`Перейти к разделу ${card.title}`}
              >
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-[var(--color-accent)] h-full flex flex-col">
                  <div className="flex items-center mb-4">
                    <div className="p-3 rounded-full bg-[rgba(192,157,106,0.1)] text-[var(--color-accent)] mr-4">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--color-black)]">{card.title}</h3>
                      <p className="text-sm text-[var(--color-gray)]">{card.description}</p>
                    </div>
                  </div>
                  <div className="mt-auto">
                    <span className="text-sm text-[var(--color-accent)]">Перейти →</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}