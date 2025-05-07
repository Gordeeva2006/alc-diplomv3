"use client";

import Link from "next/link";
import AdminHeader from "../AdminHeader";

export default function DirectorDashboard() {
  return (
    <div>
      <main className="flex flex-col min-h-screen">
        <AdminHeader />
        <div className="max-w-7xl mx-auto p-6 flex-grow space-y-2">
          <h1 className="text-3xl font-bold text-white">Панель управления</h1>
          <h2 className="text-center text-white">САЙТОМ ALC - ALbumen CORP</h2>
        </div>
      </main>
    </div>
    
  );
}