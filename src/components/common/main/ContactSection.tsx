'use client';

import React, { useState, useRef, useEffect } from 'react';
import { BsTelegram, BsWhatsapp, BsTelephone, BsEnvelope } from "react-icons/bs";
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import ReCAPTCHA from 'react-google-recaptcha';

// Замените на ваш SITE KEY
const RECAPTCHA_SITE_KEY = '6LcfqTcrAAAAAI-ei4DszP03YmH-OezKPilCj-Iw';

type FormData = {
  name: string;
  question: string;
  phone: string;
  agreement: boolean;
  'g-recaptcha-response'?: string;
};

export default function ContactPage() {
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      name: '',
      question: '',
      phone: '',
      agreement: false,
    },
  });

  const [message, setMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [recaptchaError, setRecaptchaError] = useState('');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Валидация телефона при потере фокуса
  const handlePhoneBlur = (value: string) => {
    if (!value.match(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/)) {
      setPhoneError('Введите корректный телефон в формате +7 (XXX) XXX-XX-XX');
    } else {
      setPhoneError('');
    }
  };

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const token = recaptchaRef.current?.getValue();
    if (!token) {
      setRecaptchaError('Подтвердите, что вы не робот');
      return;
    }

    try {
      setMessage('');
      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          phone: data.phone.replace(/\D/g, ''),
          recaptchaToken: token,
        }),
      });

      if (!response.ok) throw new Error('Ошибка отправки формы');

      setMessage('Ваш вопрос успешно отправлен!');
      reset();
      recaptchaRef.current?.reset();
    } catch (error) {
      console.error('Ошибка:', error);
      setMessage('Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.');
    }
  };

  return (
    <section className="py-8 bg-[var(--color-background)]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[var(--color-accent)] mb-12" id="contact">
          Есть вопрос? Задайте его нашей команде
        </h2>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Левая часть - Форма */}
          <div className="flex-1 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col justify-around bg-dark rounded-2xl p-4 shadow-md h-full">
              {/* Имя */}
              <input
                type="text"
                {...register('name', { required: 'Имя обязательно' })}
                placeholder="Ваше имя"
                className="w-full px-4 py-3 bg-transparent rounded-lg border 
                         border-[var(--color-gray)] focus:border-[var(--color-accent)] 
                         focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}

              {/* Вопрос */}
              <input
                type="text"
                {...register('question', { required: 'Введите ваш вопрос' })}
                placeholder="Ваш вопрос"
                className="w-full px-4 py-3 bg-transparent rounded-lg border 
                         border-[var(--color-gray)] focus:border-[var(--color-accent)] 
                         focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              {errors.question && <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>}

              {/* Телефон с маской */}
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: 'Телефон обязателен',
                  validate: (value) =>
                    value.match(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/)
                      ? true
                      : 'Введите корректный телефон в формате +7 (XXX) XXX-XX-XX',
                }}
                render={({ field }) => (
                  <IMaskInput
                    {...field}
                    mask="+7 (000) 000-00-00"
                    onAccept={(value) => field.onChange(value)}
                    onBlur={() => handlePhoneBlur(field.value)}
                    placeholder="Ваш телефон"
                    className="w-full px-4 py-3 bg-transparent rounded-lg border 
                             border-[var(--color-gray)] focus:border-[var(--color-accent)] 
                             focus:ring-2 focus:ring-[var(--color-accent)]"
                  />
                )}
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>}
              {phoneError && <p className="text-red-500 text-sm mt-1">{phoneError}</p>}

              {/* Согласие */}
              <div className="space-y-4 mt-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    {...register('agreement', {
                      required: 'Необходимо согласие на обработку данных',
                    })}
                    className="rounded text-[var(--color-accent)] 
                             focus:ring-[var(--color-accent)]"
                  />
                  <label htmlFor="agreement" className="text-sm text-[var(--color-gray)]">
                    Даю согласие на обработку
                    <a href="/policy" className="text-[var(--color-accent)] underline ml-1">
                      Политики конфиденциальности
                    </a>
                  </label>
                </div>
                {errors.agreement && <p className="text-red-500 text-sm mt-1">{errors.agreement.message}</p>}

                {/* reCAPTCHA */}
                <div className="flex justify-center">
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={RECAPTCHA_SITE_KEY}
                    hl="ru"
                    className="mx-auto"
                  />
                </div>
                {recaptchaError && <p className="text-red-500 text-sm text-center">{recaptchaError}</p>}

                {/* Кнопка отправки */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[var(--color-accent)] text-white 
                           py-3 rounded-lg hover:bg-opacity-90 transition-colors 
                           focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-70"
                >
                  {isSubmitting ? 'Отправка...' : 'Задать вопрос'}
                </button>

                {/* Сообщение об успехе/ошибке */}
                {message && (
                  <p
                    className={`text-center ${
                      message.includes('успешно') ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {message}
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* Правая часть - Контакты */}
          <div className="flex-1 flex flex-col items-center space-y-6">
            <div className="flex flex-row gap-4 flex-wrap justify-center w-full">
              {/* Telegram */}
              <a
                href="https://t.me/yourusername "
                target="_blank"
                rel="nofollow noreferrer"
                className="bg-dark p-6 rounded-2xl text-center space-y-4 
                        hover:bg-dark transition-colors flex-1 min-w-[160px]"
              >
                <BsTelegram className="text-[var(--color-accent)] text-5xl mx-auto" />
                <p className="text-[var(--color-accent)]">Telegram</p>
              </a>

              {/* WhatsApp */}
              <a
                href="https://wa.me/79991234567 "
                target="_blank"
                rel="nofollow noreferrer"
                className="bg-dark p-6 rounded-2xl text-center space-y-4 
                        hover:bg-dark transition-colors flex-1 min-w-[160px]"
              >
                <BsWhatsapp className="text-[var(--color-accent)] text-5xl mx-auto" />
                <p className="text-[var(--color-accent)]">WhatsApp</p>
              </a>

              {/* Телефон */}
              <a
                href="tel:+79991234567"
                className="bg-dark p-6 rounded-2xl text-center space-y-4 
                        hover:bg-dark transition-colors flex-1 min-w-[160px]"
              >
                <BsTelephone className="text-[var(--color-accent)] text-5xl mx-auto" />
                <p className="text-[var(--color-accent)]">Позвонить</p>
              </a>

              {/* Email */}
              <a
                href="mailto:support@example.com"
                className="bg-dark p-6 rounded-2xl text-center space-y-4 
                        hover:bg-dark transition-colors flex-1 min-w-[160px]"
              >
                <BsEnvelope className="text-[var(--color-accent)] text-5xl mx-auto" />
                <p className="text-[var(--color-accent)]">Email</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}