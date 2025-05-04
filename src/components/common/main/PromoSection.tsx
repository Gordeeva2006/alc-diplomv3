'use client'
import { useEffect, useState } from 'react';

interface CountdownProps {
  deadline: Date;
}

const CountdownTimer = ({ deadline }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = deadline.getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <div className="flex space-x-4">
      <TimeBlock value={timeLeft.days} label="Дней" />
      <TimeBlock value={timeLeft.hours} label="Часов" />
      <TimeBlock value={timeLeft.minutes} label="Минут" />
      <TimeBlock value={timeLeft.seconds} label="Секунд" />
    </div>
  );
};

interface TimeBlockProps {
  value: number;
  label: string;
}

const TimeBlock = ({ value, label }: TimeBlockProps) => (
  <div className="bg-[#2C2C31] p-4 rounded-lg text-center min-w-[80px]">
    <span className="text-3xl font-bold text-[#C09D6A]">{value.toString().padStart(2, '0')}</span>
    <p className="text-white text-sm">{label}</p>
  </div>
);

interface PromoSectionProps {
  title: string;
  description: string;
  buttonText: string;
  deadline: Date;
}

export const PromoSection = ({
  title = 'Специальное предложение',
  description = 'Закажите 300 кг до конца месяца — получите 5% скидку',
  buttonText = 'Успеть получить скидку',
  deadline = new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), // 14 дней по умолчанию
}: Partial<PromoSectionProps>) => {
  return (
    <section className="py-8 bg-gradient-to-r from-[#C09D6A] to-[#FEE685]">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between bg-opacity-90 p-8 rounded-lg">
          <div className="text-white mb-8 md:mb-0 md:mr-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{title}</h2>
            <p className="text-xl mb-4">{description}</p>
            <button className="bg-[#2C2C31] hover:bg-gray-700 text-white 
                              font-semibold py-3 px-8 border-2 border-[#C09D6A]
                              transition-all duration-300 rounded-lg 
                              whitespace-nowrap focus:outline-none focus:ring-2 
                              focus:ring-[#C09D6A] focus:ring-offset-2">
              {buttonText}
            </button>
          </div>
          <CountdownTimer deadline={deadline} />
        </div>
      </div>
    </section>
  );
};