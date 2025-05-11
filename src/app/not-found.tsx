// app/not-found.tsx
"use client"
import React from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-card text-white rounded-lg shadow-md p-6 text-center">
          <h1 className="text-9xl font-bold mb-4">404</h1>
          <p className="mb-6">Запрашиваемая страница не найдена.</p>
          <Link
            href="/"
            className="bg-accent text-white px-6 py-2 rounded hover:bg-accent-dark transition-colors"
          >
            Вернуться на главную
          </Link>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}