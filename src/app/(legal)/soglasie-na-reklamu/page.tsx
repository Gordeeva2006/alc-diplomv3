import React from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Link from 'next/link';

const MarketingConsentPage = () => {
  return (
    <div >
      <Header />
      <main className="leading-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-center mb-12 text-[var(--color-white)]">
            Согласие на получение рассылки
          </h1>
          
          <div className="prose prose-invert max-w-none ">
            <p>
              Вводя/предоставляя свои данные на сайте по адресу: 
              <a 
                href="#" 
                className="text-[var(--color-accent)] hover:underline ml-1"
                target="_blank"
                rel="noopener noreferrer"
              >
                XXXXXXXXXXXXXX
              </a> 
              и поддоменах, я даю свое согласие ООО «XXXXXXXXXX», зарегистрированному 
              в соответствии с законодательством РФ ИНН X0XXXXXXXX, КПП XXXXXXX01, 
              ОГРН X247700550822 (далее - Оператор) на получение от Оператора 
              рассылки рекламного, информационного характера (в том числе, но не 
              ограничиваясь, информации о специальных предложениях, товарах/услугах 
              Оператора и/или его Партнеров, запланированных мероприятиях, опросах 
              и т.д.) посредством направления сообщений на электронную почту, 
              телефонных звонков на указанный стационарный и/или мобильный телефон, 
              отправки СМС-сообщений на мобильный телефон, сообщений в WhatsApp, 
              Telegram, Viber.
            </p>
            
            <div className="bg-dark  p-4 rounded-lg my-6">
              <p className="font-medium text-[var(--color-white)]">Отзыв согласия:</p>
              <p>
                Данное согласие может быть отозвано мной в любой момент путем 
                направления письма на электронный адрес 
                <a
                  href="mailto:XXXXX@XXXXX.XXX"
                  className="text-[var(--color-accent)] hover:underline ml-1"
                >
                  XXXXX@XXXXX.XXX
                </a> 
                с пометкой: 
                <span className="block px-4 py-2 rounded mt-2 text-[var(--color-accent)]">
                  «Отказ от уведомлений о новых продуктах и услугах и специальных 
                  предложениях»
                </span>
              </p>
            </div>

            <div className="bg-dark p-4 rounded-lg mt-8">
              <p className="font-medium text-[var(--color-white)]">Важно:</p>
              <ul className="list-disc ml-6 space-y-2">
                <li >
                  Согласие действует бессрочно до момента его отзыва
                </li>
                <li >
                  Отзыв согласия не отменяет уже отправленные уведомления
                </li>
                <li >
                  Все персональные данные обрабатываются в соответствии с 
                  <a 
                    href="#" 
                    className="text-[var(--color-accent)] hover:underline ml-1"
                  >
                    Политикой конфиденциальности
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MarketingConsentPage;