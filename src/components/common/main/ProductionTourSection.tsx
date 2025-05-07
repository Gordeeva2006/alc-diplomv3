import React from 'react';
import { BsCheckCircle } from 'react-icons/bs';

const ProductionTourSection = () => {
  const stats = [
    {
      value: '1000 м²',
      label: 'площадь нового производства',
    },
    {
      value: '180+',
      label: 'наименований продукции',
    },
    {
      value: '500 кг',
      label: 'производительность линии в час',
    },
    {
      value: '100+',
      label: 'квалифицированных сотрудников',
    }
  ];

  return (
    <section className="mx-auto px-4 py-12 space-y-8 bg-[var(--color-background)] text-dark">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-[var(--color-accent)] sm:text-3xl">
          Проведем для вас экскурсию на производство
        </h2>
        <p className="mt-4 text-lg text-white sm:text-base">
          Вы сможете узнать подробно про технологический процесс, ознакомиться с образцами продукции,
          встретиться с основателями Endorphin и задать все интересующие вопросы.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className="flex items-center p-4 bg-dark rounded-xl transition-transform hover:scale-105"
          >
            <div className="rounded-full p-3 bg-[var(--color-accent)] shrink-0">
              <BsCheckCircle className="w-6 h-6 text-white sm:w-5 sm:h-5" />
            </div>
            <div className="ml-4">
              <span className="text-2xl font-bold text-[var(--color-accent)] sm:text-xl">
                {stat.value}
              </span>
              <p className="text-sm text-[var(--color-gray)] sm:text-xs">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductionTourSection;