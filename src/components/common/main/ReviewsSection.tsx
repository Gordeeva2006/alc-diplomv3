import React from 'react';
import { FaStar } from 'react-icons/fa';

const reviews = [
  {
    id: 1,
    author: 'Роман',
    rating: 4,
    text: 'Футболка выглядит очень круто, история еще круче, Арсен отец. Цена очень высокая, качество самой футболки как футболки за 1200р, принт хороший. Если вам не жалко денег как мне то покупайте, но лучше купите у Арсена Креатин!',
    date: '20 апреля 2025'
  },
  {
    id: 3,
    author: 'Айрат',
    rating: 5,
    text: 'Пил строго по рекомендации в течении месяца. Эффект накопительный, где то через неделю заметил улучшения. Стало больше энергии, силы, выносливости. Внутренний настрой космодесантника',
    date: '4 апреля 2025'
  }
];

const ReviewsSection = () => {
  return (
    <section className="py-8 bg-[var(--color-background)]">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center text-[var(--color-accent)] mb-12">
          Отзывы клиентов
        </h2>
        
        <div className="flex flex-wrap gap-6 mb-12">
          {reviews.map(review => (
            <div 
              key={review.id} 
              className="flex-1 bg-dark rounded-lg p-6 min-w-[300px] hover:bg-[var(--color-hover)] transition-colors duration-300"
              style={{ flexBasis: 'calc(33.33% - 1rem)'}}
            >
              {/* Заголовок отзыва */}
              <div className="flex items-center space-x-4 mb-4">
                <div className="bg-[var(--color-accent)] text-[var(--color-white)] w-12 h-12 rounded-full flex items-center justify-center">
                  {review.author[0]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-white)]">{review.author}</h3>
                  <div className="flex space-x-1 text-[var(--color-accent)]">
                    {[...Array(5)].map((_, i) => (
                      <FaStar 
                        key={i} 
                        className={`w-4 h-4 ${i < review.rating ? 'text-[var(--color-accent)]' : 'text-[var(--color-gray)]'}`} 
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Текст отзыва */}
              <p className="text-[var(--color-gray)] mb-4">{review.text}</p>
              
              {/* Дата */}
              <div className="text-sm text-[var(--color-gray-light)] mt-auto">{review.date}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;