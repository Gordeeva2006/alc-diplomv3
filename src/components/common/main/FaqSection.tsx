'use client';

import React, { useState } from 'react';
import { BsPlus, BsDash, BsTruck, BsCreditCard, BsArrowReturnLeft, BsBoxArrowInRight } from 'react-icons/bs';

const FaqSection = () => {
  const [activeId, setActiveId] = useState(null);

  const toggle = (id) => {
    setActiveId(activeId === id ? null : id);
  };

  const faqs = [
    {
      id: 1,
      title: 'Доставка',
      icon: <BsTruck />,
      content: (
        <>
          <p className="text-[var(--color-gray)] mb-4">
            Мы сотрудничаем с проверенной транспортной компанией "Деловые линии", которая обеспечивает надёжную доставку в любой регион.
            Все наши отправления застрахованы на полную стоимость. При получении обязательно проверяйте целостность упаковки и соответствие Продукции заявке.
          </p>

          <h3 className="text-lg font-semibold text-white mb-2">Сроки доставки:</h3>
          <ul className="list-disc pl-6 text-[var(--color-gray)] space-y-2 mb-4">
            <li>По России: 7-14 рабочих дней в зависимости от региона</li>
            <li>По СНГ: 14-28 дней (включая таможенное оформление)</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">Стоимость:</h3>
          <p className="text-[var(--color-gray)] mb-4">
            Рассчитывается индивидуально при заключении договора. Включает страхование, упаковку и срочность доставки.
          </p>
        </>
      )
    },
    {
      id: 2,
      title: 'Отправка',
      icon: <BsBoxArrowInRight />,
      content: (
        <>
          <p className="text-[var(--color-gray)] mb-4">
            Заявки отправляются после подписания договора и внесения предоплаты в размере 50%. Это позволяет нам гарантировать начало производства и обеспечить высокое качество продукции.
          </p>

          <h3 className="text-lg font-semibold text-white mb-2">Производственные этапы:</h3>
          <ul className="list-disc pl-6 text-[var(--color-gray)] space-y-2 mb-4">
            <li>Обработка заявки и подтверждение деталей - 1-2 дня</li>
            <li>Производство продукции - 10 рабочих дней</li>
            <li>Контроль качества и упаковка - 1 день</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">Упаковка:</h3>
          <p className="text-[var(--color-gray)] mb-4">
            Продукция упаковывается в специализированную пищевую тару с соблюдением всех санитарных норм. Для хрупких изделий используется дополнительная защитная обрешётка.
          </p>
        </>
      )
    },
    {
      id: 3,
      title: 'Оплата',
      icon: <BsCreditCard />,
      content: (
        <>
          <p className="text-[var(--color-gray)] mb-4">
            Мы принимаем оплату по безналичному расчёту согласно реквизитам, указанным в договоре. Для юридических лиц доступен полный пакет бухгалтерских документов.
          </p>

          <h3 className="text-lg font-semibold text-white mb-2">Доступные варианты:</h3>
          <ul className="list-disc pl-6 text-[var(--color-gray)] space-y-2 mb-4">
            <li>Безналичный расчёт между юридическими лицами</li>
            <li>Оплата по счёту-фактуре</li>
            <li>Оплата через платёжные системы (для физических лиц)</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">Безопасность:</h3>
          <p className="text-[var(--color-gray)] mb-4">
            Все финансовые операции проходят через защищённые каналы связи. Мы используем современные технологии шифрования данных.
          </p>
        </>
      )
    },
    {
      id: 4,
      title: 'Возврат (надлежащее качество)',
      icon: <BsArrowReturnLeft />,
      content: (
        <>
          <p className="text-[var(--color-gray)] mb-4">
            Согласно законодательству РФ (Постановление Правительства №924 от 19.01.1998), пищевые продукты надлежащего качества не подлежат возврату или обмену.
          </p>

          <h3 className="text-lg font-semibold text-white mb-2">Исключения:</h3>
          <ul className="list-disc pl-6 text-[var(--color-gray)] space-y-2 mb-4">
            <li>Продукция с истекшим сроком годности</li>
            <li>Нарушение условий хранения при транспортировке</li>
            <li>Повреждение упаковки при получении</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">Альтернативные решения:</h3>
          <p className="text-[var(--color-gray)]">
            В случае изменения потребностей вы можете обсудить возможность замены продукции на другую позицию из нашего каталога. Сроки и условия замены согласовываются индивидуально.
          </p>
        </>
      )
    },
    {
      id: 5,
      title: 'Возврат (ненадлежащее качество)',
      icon: <BsArrowReturnLeft />,
      content: (
        <>
          <p className="text-[var(--color-gray)] mb-4">
            В случае получения бракованной продукции мы гарантируем оперативное решение вопроса в соответствии с Законом "О защите прав потребителей".
          </p>

          <h3 className="text-lg font-semibold text-white mb-2">Процедура возврата:</h3>
          <ol className="list-decimal pl-6 text-[var(--color-gray)] space-y-2 mb-4">
            <li>Немедленно сообщите о проблеме нашему менеджеру по телефону</li>
            <li>Оформите акт о выявленном дефекте с фотографическим подтверждением</li>
            <li>Получите инструкции по возврату продукции</li>
          </ol>

          <h3 className="text-lg font-semibold text-white mb-2">Компенсации:</h3>
          <ul className="list-disc pl-6 text-[var(--color-gray)] space-y-2 mb-4">
            <li>Компенсация стоимости обратной доставки</li>
            <li>Возврат 100% стоимости бракованной продукции</li>
            <li>При необходимости - срочное изготовление замены</li>
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

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq) => (
            <div key={faq.id} className="mb-4">
              <button
                onClick={() => toggle(faq.id)}
                className="flex items-center justify-between w-full p-5 text-left bg-dark rounded-lg transition-colors hover:bg-[var(--color-hover)]"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-[var(--color-accent)] text-xl">{faq.icon}</span>
                  <span className="text-white font-medium">{faq.title}</span>
                </div>
                <span className="text-[var(--color-accent)]">
                  {activeId === faq.id ? <BsDash /> : <BsPlus />}
                </span>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeId === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 bg-dark rounded-b-lg border-t border-[var(--color-gray)] border-opacity-20">
                  {faq.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;