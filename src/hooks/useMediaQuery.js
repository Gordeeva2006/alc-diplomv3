"use client";

import { useState, useEffect } from 'react';

/**
 * Хук для отслеживания медиа-запросов для адаптивного дизайна
 * @param {string} query - CSS медиа запрос, например "(max-width: 768px)"
 * @returns {boolean} - Результат проверки медиа-запроса
 */
export function useMediaQuery(query) {
  // Изначально устанавливаем значение по умолчанию на основе серверного рендеринга
  const getMatches = (query) => {
    // Проверяем, что мы в браузере, иначе возвращаем false для SSR
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Инициализируем значение после монтирования компонента
    setMatches(getMatches(query));

    // Создаем медиа запрос
    const mediaQuery = window.matchMedia(query);

    // Определяем функцию обработчика для изменений медиа запроса
    const handleChange = () => setMatches(mediaQuery.matches);

    // Добавляем слушателя событий с учетом разных API браузеров
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
    } else {
      // Поддержка для старых браузеров
      mediaQuery.addListener(handleChange);
    }

    // Очистка при размонтировании
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handleChange);
      } else {
        // Поддержка для старых браузеров
        mediaQuery.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}