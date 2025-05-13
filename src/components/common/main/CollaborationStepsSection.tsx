import React, { useState } from 'react';
import { BsDownload, BsHeadset, BsFileEarmarkCheck, BsClipboardData, BsTruckFront } from 'react-icons/bs';
import clsx from 'clsx';

const CollaborationStepsSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = [
    {
      number: 1,
      icon: <BsDownload />,
      title: 'Регистрация',
      description: 'Создайте учетную запись в нашей системе'
    },
    {
      number: 2,
      icon: <BsHeadset />,
      title: 'Выбор продукции',
      description: 'Подберите интересующие вас товары из каталога'
    },
    {
      number: 3,
      icon: <BsFileEarmarkCheck />,
      title: 'Консультация',
      description: 'Получите индивидуальные рекомендации от менеджера'
    },
    {
      number: 4,
      icon: <BsClipboardData />,
      title: 'Договор',
      description: 'Подпишите договор с нашим представителем'
    },
    {
      number: 5,
      icon: <BsClipboardData />,
      title: 'Производство',
      description: 'Наши специалисты приступят к изготовлению продукции'
    },
    {
      number: 6,
      icon: <BsTruckFront />,
      title: 'Доставка',
      description: 'Готовый заказ отправится к вам в течение 14 дней'
    }
  ];

  return (
    <section className="py-12 md:py-16 bg-[var(--color-background)] relative overflow-hidden">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-[var(--color-accent)] mb-12 md:mb-16">
          Как начать сотрудничество
        </h2>
        
        {/* Горизонтальный прогресс-бар для десктоп */}
        <div className="hidden lg:flex justify-between items-center mb-16 relative">
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              <div 
                className={clsx(
                  "flex flex-col items-center group",
                  activeStep >= step.number && "text-[var(--color-accent)]"
                )}
                onMouseEnter={() => setActiveStep(step.number)}
              >
                {/* Круг с номером */}
                <div className={clsx(
                  "w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-3",
                  "border-2 border-[var(--color-accent)] text-white font-bold text-lg md:text-xl",
                  activeStep >= step.number && "bg-[var(--color-accent)] text-dark"
                )}>
                  {step.number}
                </div>
                
                {/* Текст */}
                <div className="text-center max-w-[140px]">
                  <p className={clsx(
                    "font-medium text-sm md:text-base",
                    activeStep >= step.number ? "text-[var(--color-accent)]" : "text-white"
                  )}>
                    {step.title}
                  </p>
                  <p className={clsx(
                    "text-gray-400 text-xs md:text-sm mt-1",
                    activeStep >= step.number && "text-gray-300"
                  )}>
                    {step.description}
                  </p>
                </div>
              </div>
              
              {/* Линия соединения */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-0.5 bg-gradient-to-r from-[var(--color-accent)] to-transparent opacity-30"></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Вертикальный список для мобильных */}
        <div className="lg:hidden space-y-6">
          {steps.map((step, index) => (
            <StepCard 
              key={step.number}
              step={step}
              index={index}
              isActive={activeStep === step.number}
              setActiveStep={() => setActiveStep(step.number)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

// Карточка шага для мобильных
const StepCard = ({ step, index, isActive, setActiveStep }) => {
  return (
    <div 
      className={clsx(
        "bg-dark rounded-xl p-5 shadow-md transition-all duration-300",
        isActive ? "ring-2 ring-[var(--color-accent)] scale-105" : "hover:scale-102"
      )}
      onClick={setActiveStep}
    >
      <div className="flex items-start">
        {/* Номер шага */}
        <div className={clsx(
          "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center mr-4",
          "border-2 border-[var(--color-accent)] text-white font-bold",
          isActive && "bg-[var(--color-accent)] text-dark"
        )}>
          {step.number}
        </div>
        
        {/* Контент */}
        <div className="flex-1">
          <h3 className={clsx(
            "font-bold text-base md:text-lg mb-1",
            isActive ? "text-[var(--color-accent)]" : "text-white"
          )}>
            {step.title}
          </h3>
          <p className={clsx(
            "text-gray-400 text-sm",
            isActive && "text-gray-300"
          )}>
            {step.description}
          </p>
        </div>
        
        {/* Иконка */}
        <div className="text-[var(--color-accent)] text-xl md:text-2xl flex-shrink-0 ml-2">
          {step.icon}
        </div>
      </div>
    </div>
  );
};

export default CollaborationStepsSection;