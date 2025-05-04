"use client"
import Image from 'next/image';
import Link from 'next/link';

const HeroSection = () => {
  return (
    <section className="relative h-screen overflow-hidden">
      {/* Основной фон */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.webp"
          alt="Background"
          fill
          priority
          quality={100}
          className="object-cover"
        />
      </div>

      {/* Размытый слой для текста */}
      <div className="absolute inset-0 z-10 bg-black/40 blur-sm"></div>

      {/* Контент */}
      <div className="relative max-w-7xl mx-auto px-4 py-20 h-full flex items-center z-20">
        <div className="max-w-md space-y-8">
          <h1 className="text-5xl font-bold text-white leading-tight">
            <b>Пищевые добавки под вашим брендом<br />
            с ценами до –50%</b>
          </h1>
          <p className="text-white text-xl">
            Уникальная возможность приобрести премиальные добавки 
            по специальной цене в течение ограниченного времени
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;