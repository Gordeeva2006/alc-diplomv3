// app/admin/questions/page.tsx
'use client';
import { useEffect, useState } from 'react';

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
  const [viewingQuestion, setViewingQuestion] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setIsLoading(true);
      try {
        const url = new URL('/api/admin/questions', window.location.origin);
        url.searchParams.set('page', page.toString());
        url.searchParams.set('pageSize', pageSize.toString());
        if (searchQuery) url.searchParams.set('search', searchQuery);
        const res = await fetch(url.toString());
        const data = await res.json();
        setQuestions(data.data || []);
        setTotal(data.pagination?.total || 0);
      } catch (err) {
        setQuestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQuestions();
  }, [page, pageSize, searchQuery]);

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm('Удалить вопрос?')) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
      setQuestions(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      alert('Ошибка удаления');
    } finally {
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[var(--color-dark)] text-white flex flex-col min-h-screen">
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent)]"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-dark)] text-white flex flex-col min-h-screen">
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto py-12 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-white)]">
              Вопросы пользователей
            </h1>
          </div>
          <div className="mb-6">
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border rounded bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            />
          </div>
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
                {questions.length > 0 ? (
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
                            disabled={deleting}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-6 border-b border-[var(--color-gray)] text-[var(--color-gray)]">
                      Нет данных
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Предыдущая
            </button>
            <span className="text-sm text-[var(--color-gray)]">
              Страница {page} из {Math.ceil(total / pageSize)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * pageSize >= total || isLoading}
              className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
            >
              Следующая
            </button>
          </div>
        </div>
        {viewingQuestion && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-dark)] p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-accent)]">
                  Вопрос #{viewingQuestion.id}
                </h3>
                <button onClick={() => setViewingQuestion(null)} className="text-gray-400 hover:text-white">
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