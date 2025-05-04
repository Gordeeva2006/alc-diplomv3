'use client'
import React, { useState } from 'react';
import { BsTruck, BsCreditCard, BsArrowReturnLeft, BsBoxArrowInRight } from 'react-icons/bs';

const FaqSection = () => {
  const [activeTab, setActiveTab] = useState('dostavka');

  const tabs = [
    {
      id: 'dostavka',
      label: 'Доставка',
      icon: <BsTruck className="w-6 h-6" />,
      content: (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <BsTruck className="text-[var(--color-accent)] text-2xl" />
            <span className="text-xl font-bold text-[var(--color-white)]">Доставка по России и СНГ</span>
          </div>
          <p className="text-[var(--color-gray)] mb-4">
            Осуществляется курьерской службой Деловые линии. Все заказы застрахованы.
            Проверяйте целостность при получении.
          </p>
          <ul className="list-disc pl-6 text-[var(--color-gray)] space-y-2">
            <li>Сроки: 7-14 дней по России, до 28 дней по СНГ</li>
            <li>Стоимость рассчитывается при заключнеии договора</li>
            <li>Отправка после 100% предоплаты</li>
          </ul>
        </>
      )
    },
    {
      id: 'otpravka',
      label: 'Отправка',
      icon: <BsBoxArrowInRight className="w-6 h-6" />,
      content: (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <BsBoxArrowInRight className="text-[var(--color-accent)] text-2xl" />
            <span className="text-xl font-bold text-[var(--color-white)]">Условия отправки</span>
          </div>
          <p className="text-[var(--color-gray)] mb-4">
            Заказы отправляются после подписания договора и предоплаты в размере 50%:
          </p>
          <ul className="list-disc pl-6 text-[var(--color-gray)] space-y-2">
            <li>Производство в течение 10 рабочих дней</li>
          </ul>
        </>
      )
    },
    {
      id: 'oplata',
      label: 'Оплата',
      icon: <BsCreditCard className="w-6 h-6" />,
      content: (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <BsCreditCard className="text-[var(--color-accent)] text-2xl" />
            <span className="text-xl font-bold text-[var(--color-white)]">Способы оплаты</span>
          </div>
          <p className="text-[var(--color-gray)] mb-4">
            По банковским реквезитам указанным в договоре.
          </p>
        </>
      )
    },
    {
      id: 'vozvrat-1',
      label: 'Возврат (надлежащее качество)',
      icon: <BsArrowReturnLeft className="w-6 h-6" />,
      content: (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <BsArrowReturnLeft className="text-[var(--color-accent)] text-2xl" />
            <span className="text-xl font-bold text-[var(--color-white)]">Возврат товара</span>
          </div>
          <p className="text-[var(--color-gray)] mb-4">
            Пищевые продукты не подлежат возврату.
          </p>
        </>
      )
    },
    {
      id: 'vozvrat-2',
      label: 'Возврат (ненадлежащее)',
      icon: <BsArrowReturnLeft className="w-6 h-6" />,
      content: (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <BsArrowReturnLeft className="text-[var(--color-error)] text-2xl" />
            <span className="text-xl font-bold text-[var(--color-white)]">Возврат брака</span>
          </div>
          <p className="text-[var(--color-gray)] mb-4">
            При получении бракованного товара:
          </p>
          <ul className="list-disc pl-6 text-[var(--color-gray)] space-y-2">
            <li>Мы компенсируем стоимость обратной доставки</li>
            <li>Заполните форму ниже</li>
          </ul>
        </>
      )
    }
  ];

  return (
    <section className="py-8 bg-[var(--color-background)]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[var(--color-accent)] mb-8">
          Частые вопросы
        </h2>
        
        {/* Вкладки */}
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`flex-1 px-6 py-3 rounded-lg transition-colors ${
                activeTab === tab.id 
                  ? 'bg-[var(--color-accent)] text-[var(--color-white)]' 
                  : 'bg-dark text-[var(--color-gray)] hover:bg-[var(--color-hover)]'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center space-x-3">
                {React.cloneElement(tab.icon, { 
                  className: `w-6 h-6 ${activeTab === tab.id ? 'text-[var(--color-white)]' : 'text-[var(--color-accent)]'}` 
                })}
                <span>{tab.label}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Контент активной вкладки */}
        <div className="bg-dark rounded-lg p-6">
          {tabs.find(tab => tab.id === activeTab)?.content}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;