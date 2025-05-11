// app/error.tsx
"use client"
import React from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error }: ErrorProps) {
  // Определяем сообщение в зависимости от типа ошибки
  const getErrorMessage = () => {
    if (error.message.includes('401')) {
      return 'Для доступа к этой странице необходимо авторизоваться.';
    }
    if (error.message.includes('403')) {
      return 'Доступ запрещён. У вас недостаточно прав.';
    }
    if (error.message.includes('500')) {
      return 'Произошла внутренняя ошибка сервера.';
    }
    return 'Произошла неизвестная ошибка. Попробуйте позже.';
  };

  return (
    <html lang="ru">
      <body className='flex flex-col'>
        <Header />
        <main className="flex-1 flex items-center justify-center p-4 flex-grow">
          <div className="w-full max-w-md  text-white rounded-lg shadow-md p-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Ошибка</h1>
            <p className="mb-6">{getErrorMessage()}</p>
            <Link
              href="/"
              className="bg-accent text-white px-6 py-2 rounded hover:bg-accent-dark transition-colors"
            >
              Вернуться на главную
            </Link>
          </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}