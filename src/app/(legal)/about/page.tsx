import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Image from 'next/image';
import { FiAward, FiUsers, FiPackage, FiGlobe } from 'react-icons/fi';

const AboutPage = () => {
  return (
    <div >
      <Header />
      <main >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Главный баннер */}
          <div className="rounded-2xl overflow-hidden relative h-[400px] mb-16 ">
            <div className="absolute inset-0 flex items-center justify-center">
              <h1 className="text-5xl font-bold text-white text-center">
                С 2010 года создаем <br /> качественные продукты питания
              </h1>
            </div>
          </div>

          {/* Основной контент */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Основное описание */}
            <div className="md:col-span-2 space-y-6">
              <h2 className="text-3xl font-semibold text-white">
                Наша миссия
              </h2>
              <p className="text-[var(--color-gray)] text-lg">
                В ООО "XXXXXXXXXX" мы верим, что качественное питание - основа здоровой жизни.
                Более 14 лет мы совершенствуем технологии производства, чтобы предлагать:
              </p>
              <ul className="space-y-3 ml-6 list-disc text-[var(--color-gray)]">
                <li>Продукты без ГМО и консервантов</li>
                <li>Экологически чистое сырье</li>
                <li>Контроль качества на всех этапах</li>
                <li>Инновационные решения в пищевой промышленности</li>
              </ul>
            </div>

            {/* Блок статистики */}
            <div className="space-y-4">
              <div className="p-6 bg-dark rounded-lg">
                <FiAward className="w-12 h-12 text-[var(--color-accent)] mb-4" />
                <h3 className="text-2xl font-bold text-white">14+</h3>
                <p className="text-[var(--color-gray)]">лет на рынке</p>
              </div>
              <div className="p-6 bg-dark rounded-lg">
                <FiUsers className="w-12 h-12 text-[var(--color-accent)] mb-4" />
                <h3 className="text-2xl font-bold text-white">500+</h3>
                <p className="text-[var(--color-gray)]">постоянных клиентов</p>
              </div>
              <div className="p-6 bg-dark rounded-lg">
                <FiPackage className="w-12 h-12 text-[var(--color-accent)] mb-4" />
                <h3 className="text-2xl font-bold text-white">1500+</h3>
                <p className="text-[var(--color-gray)]">тонн продукции в год</p>
              </div>
            </div>
          </div>

          {/* Блок ценностей */}
          <div className="mt-16 space-y-8">
            <h2 className="text-3xl font-semibold text-center text-white">
              Наши ценности
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 bg-dark rounded-lg text-center">
                <FiGlobe className="w-10 h-10 text-[var(--color-accent)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white">Экологичность</h3>
                <p className="text-[var(--color-gray)]">Минимизация воздействия на окружающую среду</p>
              </div>
              <div className="p-6 bg-dark rounded-lg text-center">
                <FiAward className="w-10 h-10 text-[var(--color-accent)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white">Качество</h3>
                <p className="text-[var(--color-gray)]">Сертификаты ISO 9001 и ХАССП</p>
              </div>
              <div className="p-6 bg-dark rounded-lg text-center">
                <FiUsers className="w-10 h-10 text-[var(--color-accent)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white">Клиентоориентированность</h3>
                <p className="text-[var(--color-gray)]">Индивидуальный подход к каждому партнеру</p>
              </div>
              <div className="p-6 bg-dark rounded-lg text-center">
                <FiPackage className="w-10 h-10 text-[var(--color-accent)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white">Инновации</h3>
                <p className="text-[var(--color-gray)]">Внедрение современных технологий</p>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;