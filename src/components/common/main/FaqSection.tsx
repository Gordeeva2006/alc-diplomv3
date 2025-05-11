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
            <span className="text-xl font-bold text-white">Доставка по России и СНГ</span>
          </div>
          
          <p className="text-[var(--color-gray)] mb-4">
            Мы сотрудничаем с проверенной транспортной компанией "Деловые линии", которая обеспечивает надёжную доставку в любой регион.
            Все наши заказы застрахованы на полную стоимость. При получении обязательно проверяйте целостность упаковки и соответствие Продукции заказу.
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

          <h3 className="text-lg font-semibold text-white mb-2">Отслеживание:</h3>
          <p className="text-[var(--color-gray)]">
            После передачи груза вы получите трек-номер для отслеживания на сайте ТК. Специалисты компании сообщат вам о любых задержках и помогут решить возникшие вопросы.
          </p>
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
            <span className="text-xl font-bold text-white">Условия отправки</span>
          </div>
          
          <p className="text-[var(--color-gray)] mb-4">
            Заказы отправляются после подписания договора и внесения предоплаты в размере 50%. Это позволяет нам гарантировать начало производства и обеспечить высокое качество продукции.
          </p>

          <h3 className="text-lg font-semibold text-white mb-2">Производственные этапы:</h3>
          <ul className="list-disc pl-6 text-[var(--color-gray)] space-y-2 mb-4">
            <li>Обработка заказа и подтверждение деталей - 1-2 дня</li>
            <li>Производство продукции - 10 рабочих дней</li>
            <li>Контроль качества и упаковка - 1 день</li>
          </ul>

          <h3 className="text-lg font-semibold text-white mb-2">Упаковка:</h3>
          <p className="text-[var(--color-gray)] mb-4">
            Продукция упаковывается в специализированную пищевую тару с соблюдением всех санитарных норм. Для хрупких изделий используется дополнительная защитная обрешётка.
          </p>

          <h3 className="text-lg font-semibold text-white mb-2">Документы:</h3>
          <p className="text-[var(--color-gray)]">
            К каждому заказу прилагаются сертификаты качества, товарная накладная и инструкции по хранению продукции.
          </p>
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
            <span className="text-xl font-bold text-white">Способы оплаты</span>
          </div>
          
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

          <h3 className="text-lg font-semibold text-white mb-2">Сроки обработки:</h3>
          <p className="text-[var(--color-gray)]">
            Обработка платежей занимает 1-2 рабочих дня. Старт производства возможен только после подтверждения зачисления средств на счёт.
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
            <span className="text-xl font-bold text-white">Возврат Продукции</span>
          </div>
          
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
      id: 'vozvrat-2',
      label: 'Возврат (ненадлежащее)',
      icon: <BsArrowReturnLeft className="w-6 h-6" />,
      content: (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <BsArrowReturnLeft className="text-[var(--color-error)] text-2xl" />
            <span className="text-xl font-bold text-white">Возврат брака</span>
          </div>
          
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

          <h3 className="text-lg font-semibold text-white mb-2">Сроки:</h3>
          <p className="text-[var(--color-gray)]">
            Рассмотрение заявки - до 3 рабочих дней. Решение проблемы - от 5 до 10 рабочих дней в зависимости от сложности ситуации.
          </p>
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
                  ? 'bg-[var(--color-accent)] text-white' 
                  : 'bg-dark text-[var(--color-gray)] hover:bg-[var(--color-hover)]'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <div className="flex items-center space-x-3">
                {React.cloneElement(tab.icon, { 
                  className: `w-6 h-6 ${activeTab === tab.id ? 'text-white' : 'text-[var(--color-accent)]'}` 
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