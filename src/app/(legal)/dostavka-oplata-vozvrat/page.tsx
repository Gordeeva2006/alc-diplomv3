'use client'
import React from 'react';
import { BsCreditCard, BsTruck, BsArrowReturnLeft, BsBoxArrowInRight, BsCheckCircle } from 'react-icons/bs';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';



const PaymentDeliveryPage = () => {
  // Данные для разделов
  const sections = [
    {
      id: 'payment',
      title: 'Оплата',
      icon: <BsCreditCard className="w-8 h-8 text-[var(--color-accent)]" />,
      content: (
        <>
          <div className="flex items-center space-x-4 mb-4">
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
      id: 'shipping',
      title: 'Отправка',
      icon: <BsBoxArrowInRight className="w-8 h-8 text-[var(--color-accent)]" />,
      content: (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-xl font-bold text-white">Условия отправки</span>
          </div>
          
          <p className="text-[var(--color-gray)] mb-4">
            Продукция изготавливается после подписания договора предоплаты в размере 50%. Это позволяет нам гарантировать начало производства и обеспечить высокое качество продукции.
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

          <h3 className="text-lg font-semibold text-white mb-2">Документы:</h3>
          <p className="text-[var(--color-gray)]">
            К каждой продукции прилагаются сертификаты качества, товарная накладная и инструкции по хранению продукции.
          </p>
        </>
      )
    },
    {
      id: 'delivery',
      title: 'Доставка',
      icon: <BsTruck className="w-8 h-8 text-[var(--color-accent)]" />,
      content: (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-xl font-bold text-white">Доставка по России и СНГ</span>
          </div>
          
          <p className="text-[var(--color-gray)] mb-4">
            Мы сотрудничаем с проверенной транспортной компанией "Деловые линии", которая обеспечивает надёжную доставку в любой регион.
            Все наши заявки застрахованы на полную стоимость. При получении обязательно проверяйте целостность упаковки и соответствие Продукции заявке.
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
      id: 'returns',
      title: 'Возврат',
      icon: <BsArrowReturnLeft className="w-8 h-8 text-[var(--color-accent)]" />,
      content: (
        <>
          <div className="flex items-center space-x-4 mb-4">
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
      id: 'returns-defect',
      title: 'Возврат брака',
      icon: <BsArrowReturnLeft className="w-8 h-8 text-[var(--color-error)]" />,
      content: (
        <>
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-xl font-bold text-white">Возврат бракованного Продукции</span>
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
    <>
      <Header />
      <main className="bg-dark leading-6">
        <div className="max-w-7xl mx-auto py-12">
          <h1 className="text-4xl font-bold text-center mb-12 text-white">
            Оплата и доставка
          </h1>
          
          {/* Все разделы в виде блоков */}
          <div className="space-y-12">
            {sections.map(section => (
              <div 
                key={section.id} 
                className="bg-dark rounded-xl p-8 shadow-xl animate-fadeIn"
              >
                <div className="flex items-start space-x-4 mb-6">
                  {section.icon}
                  <h2 className="text-2xl font-bold text-white">{section.title}</h2>
                </div>
                <div className="space-y-6">
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PaymentDeliveryPage;