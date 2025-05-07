import React from 'react';
import { BsBoxSeam, BsCheckCircle } from 'react-icons/bs';

const ProductionFeaturesSection = () => {
  const features = [
    {
      icon: <BsBoxSeam />,
      title: 'Новое оборудование',
      description: 'Работаем по современным технологическим стандартам. Обновили и расширили производственную линию в 2023 году'
    },
    {
      icon: <BsBoxSeam />,
      title: 'Собственная лаборатория',
      description: 'В ней разрабатываем индивидуальные рецептуры для СТМ, анализируем и тестируем готовую продукцию'
    },
    {
      icon: <BsCheckCircle />,
      title: 'Сертификаты',
      description: 'Используем только проверенное сырье высокого качества со всеми необходимыми сертификатами'
    }
  ];

  return (
    <div className="container mx-auto px-4 pb-12">
      <div className="flex flex-col md:flex-row gap-6">
        {features.map((feature, index) => (
          <div 
            key={index} 
            className="flex items-center space-x-4 p-6 rounded-lg 
                       bg-dark w-full md:w-1/3 
                       hover:bg-dark transition-colors"
          >
            <div className="bg-[var(--color-accent)] p-3 rounded-lg shadow-md">
              {React.cloneElement(feature.icon, { 
                className: "w-6 h-6 text-white" 
              })}
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-[var(--color-accent)]">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--color-gray)] mt-2">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionFeaturesSection;