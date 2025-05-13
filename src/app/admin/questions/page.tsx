'use client';
import { useEffect, useState, useCallback } from 'react';
import AdminHeader from '../AdminHeader';

interface Question {
  id: number;
  name: string;
  question: string;
  phone: string;
  created_at: string;
}

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Debounce для поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Загрузка данных
  const fetchQuestions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = new URL('/api/admin/questions', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('pageSize', pageSize.toString());
      if (debouncedSearchQuery) url.searchParams.set('search', debouncedSearchQuery);
      
      const res = await fetch(url.toString());
      
      if (!res.ok) throw new Error('Ошибка загрузки данных');
      
      const data = await res.json();
      setQuestions(data.data || []);
      setTotal(data.pagination?.total || 0);
    } catch (err) {
      console.error(err);
      setError('Не удалось загрузить вопросы. Попробуйте позже.');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, pageSize, debouncedSearchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Удаление вопроса
  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Удалить вопрос?')) return;
    setDeletingId(id);
    
    try {
      const res = await fetch(`/api/admin/questions/${id}`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error('Ошибка удаления');
      
      // Обновляем данные
      await fetchQuestions();
    } catch (err) {
      alert('Ошибка удаления вопроса');
    } finally {
      setDeletingId(null);
    }
  };

  // Закрытие модального окна по Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setViewingQuestion(null);
    };
    
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, []);

  // Обработчик клика вне модального окна
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) setViewingQuestion(null);
  };

  // Рассчитываем общее количество страниц
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="bg-[var(--color-dark)] text-white flex flex-col min-h-screen">
      <main className="flex-grow">
        <AdminHeader />
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-white)]">
              Вопросы пользователей
            </h1>
          </div>

          {/* Поиск */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Поиск по вопросам..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border rounded bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            
            {/* Выбор количества записей */}
            <div className="flex items-center">
              <label htmlFor="pageSize" className="mr-2 text-sm">Показать:</label>
              <select
                id="pageSize"
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-[var(--color-dark)] text-white border border-[var(--color-gray)] rounded px-2 py-1"
              >
                {[10, 25, 50, 100].map(size => (
                  <option key={size} value={size}>{size}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Сообщение об ошибке */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded text-red-300">
              {error}
            </div>
          )}

          {/* Таблица */}
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="min-w-full bg-[var(--color-dark)] border border-[var(--color-gray)]">
              <thead className="bg-[var(--color-gray)]">
                <tr>
                  <th className="py-3 px-4 text-left">ID</th>
                  <th className="py-3 px-4 text-left">Имя</th>
                  <th className="py-3 px-4 text-left">Телефон</th>
                  <th className="py-3 px-4 text-left">Дата</th>
                  <th className="py-3 px-4 text-left">Действия</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-6 border-b border-[var(--color-gray)]">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[var(--color-accent)]"></div>
                      </div>
                    </td>
                  </tr>
                ) : questions.length > 0 ? (
                  questions.map((question) => (
                    <tr key={question.id} className="hover:bg-[var(--color-dark)] transition-colors">
                      <td className="px-4 py-3 border-b border-[var(--color-gray)]">#{question.id}</td>
                      <td className="px-4 py-3 border-b border-[var(--color-gray)]">{question.name}</td>
                      <td className="px-4 py-3 border-b border-[var(--color-gray)]">{question.phone}</td>
                      <td className="px-4 py-3 border-b border-[var(--color-gray)]">
                        {new Date(question.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="px-4 py-3 border-b border-[var(--color-gray)] text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => setViewingQuestion(question)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Просмотр
                          </button>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            disabled={deletingId === question.id}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === question.id ? (
                              <span className="flex items-center">
                                <span className="animate-spin h-4 w-4 mr-2 rounded-full border-2 border-current border-t-transparent"></span>
                                Удаление...
                              </span>
                            ) : 'Удалить'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 border-b border-[var(--color-gray)] text-[var(--color-gray)]">
                      {debouncedSearchQuery ? 'Ничего не найдено' : 'Нет данных'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center">
              <label htmlFor="pageNumber" className="mr-2 text-sm">Страница:</label>
              <input
                type="number"
                id="pageNumber"
                min={1}
                max={totalPages}
                value={page}
                onChange={(e) => {
                  const newPage = Math.max(1, Math.min(totalPages, Number(e.target.value)));
                  setPage(newPage);
                }}
                className="w-16 px-2 py-1 bg-[var(--color-dark)] text-white border border-[var(--color-gray)] rounded"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                Предыдущая
              </button>
              <span className="text-sm text-[var(--color-gray)]">
                Страница {page} из {totalPages || 1}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                Следующая
              </button>
            </div>
          </div>
        </div>

        {/* Модальное окно */}
        {viewingQuestion && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={handleOverlayClick}
          >
            <div className="bg-[var(--color-dark)] p-6 rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-accent)]">
                  Вопрос #{viewingQuestion.id}
                </h3>
                <button 
                  onClick={() => setViewingQuestion(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Закрыть"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400">Имя</label>
                  <p className="mt-1 text-white">{viewingQuestion.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Телефон</label>
                  <p className="mt-1 text-white">{viewingQuestion.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Вопрос</label>
                  <p className="mt-1 text-white whitespace-pre-line">{viewingQuestion.question}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400">Дата</label>
                  <p className="mt-1 text-white">{new Date(viewingQuestion.created_at).toLocaleString('ru-RU')}</p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setViewingQuestion(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}