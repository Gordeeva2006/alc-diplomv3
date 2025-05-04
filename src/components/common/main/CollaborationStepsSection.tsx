import React from 'react';
import { BsDownload, BsHeadset, BsFileEarmarkCheck, BsClipboardData, BsTruckFront } from 'react-icons/bs';

const CollaborationStepsSection = () => {
  const steps = [
    {
      number: 1,
      icon: <BsDownload />,
      text: 'Регистрация'
    },
    {
      number: 2,
      icon: <BsHeadset />,
      text: 'Выбор продукции'
    },
    {
      number: 3,
      icon: <BsFileEarmarkCheck />,
      text: 'Консультация с менеджером'
    },
    {
      number: 4,
      icon: <BsClipboardData />,
      text: 'Заключение договора'
    },
    {
      number: 5,
      icon: <BsClipboardData />,
      text: 'Разработка дизайна и производство продукта'
    },
    {
      number: 6,
      icon: <BsTruckFront />,
      text: 'Ожидайте отгрузку в течение 14 дней с момента старта'
    }
  ];

  return (
    <section className="py-8 bg-[var(--color-background)]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[var(--color-accent)] mb-12">
          Как начать сотрудничество
        </h2>
        
        <div className="flex flex-wrap -mx-4">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="w-full md:w-1/2 lg:w-1/3 p-4"
            >
              <div className="flex flex-col h-full p-6 bg-dark rounded-lg 
                             shadow-md hover:shadow-lg transition-shadow">
                {/* Иконка и номер */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="relative">
                    <div className="bg-[var(--color-accent)] p-3 rounded-full flex items-center justify-center">
                      {React.cloneElement(step.icon, { 
                        className: "w-5 h-5 text-[var(--color-white)]" 
                      })}
                    </div>
                    
                  </div>
                  <span className="text-[var(--color-accent)] text-lg font-semibold">
                    Шаг {step.number}
                  </span>
                </div>

                {/* Основной текст */}
                <p className="text-[var(--color-gray)] text-base flex-1 mt-2">
                  {step.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollaborationStepsSection;