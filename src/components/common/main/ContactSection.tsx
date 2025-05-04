import React from 'react';
import { BsTelegram, BsWhatsapp, BsTelephone, BsEnvelope } from "react-icons/bs";

const ContactSection = () => {
  return (
    <section className="py-8 bg-[var(--color-background)]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[var(--color-accent)] mb-12">
          Есть вопрос? Задайте его нашей команде
        </h2>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Левая часть - Форма */}
          <div className="flex-1 space-y-6">
            <form className="flex flex-col justify-around bg-dark rounded-2xl p-4 shadow-md h-full">
              {/* Поле имени */}
              <div className="relative">
                <input 
                  type="text" 
                  id="name" 
                  className="w-full px-4 py-3 bg-transparent rounded-lg border 
                           border-[var(--color-gray)] focus:border-[var(--color-accent)] 
                           focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <label 
                  htmlFor="name" 
                  className="absolute left-4 top-3 text-[var(--color-gray)] 
                           pointer-events-none transition-all duration-200 
                           peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                           peer-focus:top-0 peer-focus:text-sm peer-focus:text-[var(--color-accent)]"
                >
                  Ваше имя
                </label>
              </div>

              {/* Поле вопроса */}
              <div className="relative">
                <input 
                  type="text" 
                  id="question" 
                  className="w-full px-4 py-3 bg-transparent rounded-lg border 
                           border-[var(--color-gray)] focus:border-[var(--color-accent)] 
                           focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <label 
                  htmlFor="question" 
                  className="absolute left-4 top-3 text-[var(--color-gray)] 
                           pointer-events-none transition-all duration-200 
                           peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                           peer-focus:top-0 peer-focus:text-sm peer-focus:text-[var(--color-accent)]"
                >
                  Ваш вопрос
                </label>
              </div>

              {/* Поле телефона */}
              <div className="relative">
                <input 
                  type="tel" 
                  id="phone" 
                  className="w-full px-4 py-3 bg-transparent rounded-lg border 
                           border-[var(--color-gray)] focus:border-[var(--color-accent)] 
                           focus:ring-2 focus:ring-[var(--color-accent)]"
                />
                <label 
                  htmlFor="phone" 
                  className="absolute left-4 top-3 text-[var(--color-gray)] 
                           pointer-events-none transition-all duration-200 
                           peer-placeholder-shown:top-3 peer-placeholder-shown:text-base 
                           peer-focus:top-0 peer-focus:text-sm peer-focus:text-[var(--color-accent)]"
                >
                  Номер телефона
                </label>
              </div>

              {/* Согласие и кнопка */}
              <div className="space-y-4 mt-2">
                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox" 
                    id="agreement" 
                    className="rounded text-[var(--color-accent)] 
                             focus:ring-[var(--color-accent)]"
                  />
                  <label htmlFor="agreement" className="text-sm text-[var(--color-gray)]">
                    Я согласен с 
                    <a href="/policy" className="text-[var(--color-accent)] underline ml-1">
                      Политикой конфиденциальности
                    </a>
                    <a href="/soglasie-na-reklamu" className="text-[var(--color-accent)] underline ml-1">
                      Согласием на рекламу
                    </a>
                    <a href="/publichnaya-oferta" className="text-[var(--color-accent)] underline ml-1">
                      Публичной офертой
                    </a>
                  </label>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-[var(--color-accent)] text-[var(--color-white)] 
                           py-3 rounded-lg hover:bg-opacity-90 transition-colors 
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                >
                  Задать вопрос
                </button>
              </div>
            </form>
          </div>
          <div className="flex-1 flex flex-col items-center space-y-6">
            {/* Контейнер с иконками */}
            <div className="flex flex-row gap-4 flex-wrap justify-center w-full">
              {/* Telegram */}
              <a 
                href="https://t.me/baza_arsen_market_bot/start=zapusk1" 
                target="_blank" 
                rel="nofollow noreferrer"
                className="bg-dark p-6 rounded-2xl text-center space-y-4 
                        hover:bg-dark transition-colors flex-1 min-w-[160px]"
              >
                <BsTelegram className="text-[var(--color-accent)] text-5xl mx-auto" />
              </a>

              {/* WhatsApp */}
              <a 
                href="https://wa.me/79991234567" 
                target="_blank" 
                rel="nofollow noreferrer"
                className="bg-dark p-6 rounded-2xl text-center space-y-4 
                        hover:bg-dark transition-colors flex-1 min-w-[160px]"
              >
                <BsWhatsapp className="text-[var(--color-accent)] text-5xl mx-auto" />
              </a>

              {/* VK */}
              <a 
                href="https://vk.com/yourpage" 
                target="_blank" 
                rel="nofollow noreferrer"
                className="bg-dark p-6 rounded-2xl text-center space-y-4 
                        hover:bg-dark transition-colors flex-1 min-w-[160px]"
              >
                <BsTelephone className="text-[var(--color-accent)] text-5xl mx-auto" />
              </a>

              <a 
                href="tel:+79991234567" 
                className="bg-dark p-6 rounded-2xl text-center space-y-4 
                        hover:bg-dark transition-colors flex-1 min-w-[160px]"
              >
                <BsTelephone className="text-[var(--color-accent)] text-5xl mx-auto" />
              </a>
              <a 
                href="mailto:support@example.com" 
                className="bg-dark p-6 rounded-2xl text-center space-y-4 
                        hover:bg-dark transition-colors flex-1 min-w-[160px]"
              >
                <BsEnvelope className="text-[var(--color-accent)] text-5xl mx-auto" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;