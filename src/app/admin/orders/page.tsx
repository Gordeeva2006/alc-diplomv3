'use client';
import { useEffect, useState } from 'react';
import AdminHeader from '../AdminHeader';

// Типы данных
interface PackagingType {
  id: number;
  name: string;
  image: string | null;
}

interface OrderItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  batch_volume: number;
  packaging_type_id: number | null;
  packaging_type_name: string | null;
  packaging_type_image: string | null;
}

interface Order {
  id: number;
  total_amount: number;
  status_name: string;
  status_id: number;
  created_at: string;
  client_type: 'individual' | 'legal_entity';
  legal_address: string;
  client_email: string;
  client_phone: string;
  individual_company: string | null;
  individual_inn: string | null;
  individual_ogrnip: string | null;
  legal_entity_company: string | null;
  legal_entity_inn: string | null;
  legal_entity_kpp: string | null;
  legal_entity_ogrn: string | null;
  contract_file?: string | null;
  certificate_file?: string | null;
  items?: OrderItem[];
}

interface Status {
  id: number;
  name: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [viewingOrder, setViewingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<number | ''>('');
  const [newContract, setNewContract] = useState<File | null>(null);
  const [newCertificates, setNewCertificates] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка статусов
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await fetch('/api/admin/statuses');
        if (!res.ok) throw new Error('Ошибка загрузки статусов');
        const data = await res.json();
        setStatuses(data || []);
      } catch (err: any) {
        console.error('Ошибка:', err.message);
        setError('Не удалось загрузить статусы');
      }
    };
    fetchStatuses();
  }, []);

  // Загрузка заказов
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const url = new URL('/api/admin/orders', window.location.origin);
        url.searchParams.set('page', page.toString());
        url.searchParams.set('pageSize', pageSize.toString());
        if (statusFilter) url.searchParams.set('status', statusFilter);
        if (searchQuery) url.searchParams.set('search', searchQuery);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('Ошибка загрузки заказов');
        const data = await res.json();
        setOrders(data.data || []);
        setTotal(data.pagination?.total || 0);
      } catch (err: any) {
        console.error('Ошибка:', err.message);
        setError('Не удалось загрузить заказы');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [page, pageSize, statusFilter, searchQuery]);

  // Информация о клиенте
  const getClientInfo = (order: Order) => (
    <div className="text-white">
      <div><strong>Email:</strong> {order.client_email}</div>
      <div><strong>Телефон:</strong> {order.client_phone || 'Не указан'}</div>
      <div><strong>Юр. адрес:</strong> {order.legal_address}</div>
      {order.client_type === 'individual' && order.individual_company && (
        <>
          <div><strong>ФИО:</strong> {order.individual_company}</div>
          <div><strong>ИНН:</strong> {order.individual_inn}</div>
          <div><strong>ОГРНИП:</strong> {order.individual_ogrnip}</div>
        </>
      )}
      {order.client_type === 'legal_entity' && order.legal_entity_company && (
        <>
          <div><strong>Компания:</strong> {order.legal_entity_company}</div>
          <div><strong>ИНН:</strong> {order.legal_entity_inn}</div>
          <div><strong>КПП:</strong> {order.legal_entity_kpp}</div>
          <div><strong>ОГРН:</strong> {order.legal_entity_ogrn}</div>
        </>
      )}
    </div>
  );

  // Обработчики действий
  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.status_id);
    setNewContract(null);
    setNewCertificates([]);
  };

  const handleViewOrder = (order: Order) => setViewingOrder(order);

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewCertificates(Array.from(e.target.files));
    }
  };

  const handleSaveOrder = async () => {
    if (!editingOrder || !newStatus) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('id', editingOrder.id.toString());
    formData.append('status', newStatus.toString());
    if (newContract) formData.append('contract', newContract);
    newCertificates.forEach(file => formData.append('certificate_file', file));

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Не удалось сохранить изменения');
      }

      // ✅ Принудительно обновляем данные заказа после сохранения
      const updatedOrderRes = await fetch(`/api/admin/orders?search=${editingOrder.id}`);
      const updatedOrderData = await updatedOrderRes.json();
      const updatedOrder = updatedOrderData.data[0];

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      setEditingOrder(updatedOrder);
    } catch (err: any) {
      console.error('Ошибка при сохранении:', err.message);
      alert(err.message || 'Произошла ошибка при сохранении');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = async (orderId: number) => {
    if (!confirm('Удалить файл договора? (Неврзвратно)')) return;
    setDeleting(true);
    try {
      const formData = new FormData();
      formData.append('id', orderId.toString());
      formData.append('delete_contract', 'true');

      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error('Ошибка удаления договора');

      // ✅ Обновляем данные заказа
      const updatedOrderRes = await fetch(`/api/admin/orders?search=${orderId}`);
      const updatedOrderData = await updatedOrderRes.json();
      const updatedOrder = updatedOrderData.data[0];

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      setEditingOrder(updatedOrder);
    } catch (err: any) {
      console.error('Ошибка:', err.message);
      alert('Не удалось удалить договор');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCertificate = async (orderId: number, certName: string) => {
    if (!confirm('Удалить файл сертификата? (Неврзвратно)')) return;
    setDeleting(true);
    try {
      const formData = new FormData();
      formData.append('id', orderId.toString());
      formData.append('delete_certificate', certName);

      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) throw new Error('Ошибка удаления сертификата');

      // ✅ Обновляем данные заказа
      const updatedOrderRes = await fetch(`/api/admin/orders?search=${orderId}`);
      const updatedOrderData = await updatedOrderRes.json();
      const updatedOrder = updatedOrderData.data[0];

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order.id === updatedOrder.id ? updatedOrder : order
        )
      );
      setEditingOrder(updatedOrder);
    } catch (err: any) {
      console.error('Ошибка:', err.message);
      alert('Не удалось удалить сертификат');
    } finally {
      setDeleting(false);
    }
  };

  // Цвета статусов
  const getStatusColor = (statusName: string) => {
    switch (statusName) {
      case 'Новый': return 'bg-blue-500';
      case 'В обработке': return 'bg-yellow-500';
      case 'Отправлен': return 'bg-purple-500';
      case 'Завершен': return 'bg-green-500';
      case 'Отменен': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  // Индикатор загрузки
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
        <AdminHeader />
        <div className="max-w-7xl mx-auto py-12 px-4">
          {/* Заголовок */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-white)]">
              Управление заказами
            </h1>
            <p className="text-[var(--color-gray)] mt-2">Просмотр и редактирование заказов клиентов</p>
          </div>

          {/* Фильтры и поиск */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Поиск по заказам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="px-4 py-2 border rounded bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] flex-grow"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border rounded bg-[var(--color-dark)] text-white border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="">Все статусы</option>
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>

          {/* Таблица заказов */}
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="min-w-full bg-[var(--color-dark)] border border-[var(--color-gray)]">
              <thead className="bg-[var(--color-gray)]">
                <tr>
                  <th className="py-3 px-4 border-b border-[var(--color-gray)] text-left">ID</th>
                  <th className="py-3 px-4 border-b border-[var(--color-gray)] text-left">Клиент</th>
                  <th className="py-3 px-4 border-b border-[var(--color-gray)] text-left">Сумма</th>
                  <th className="py-3 px-4 border-b border-[var(--color-gray)] text-left">Статус</th>
                  <th className="py-3 px-4 border-b border-[var(--color-gray)] text-left">Дата</th>
                  <th className="py-3 px-4 border-b border-[var(--color-gray)] text-left">Действия</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[var(--color-dark)] transition-colors">
                      <td className="border-b border-[var(--color-gray)] px-4 py-3">
                        <span className="font-medium text-[var(--color-accent)]">#{order.id}</span>
                      </td>
                      <td className="border-b border-[var(--color-gray)] px-4 py-3">
                        <div className="space-y-1">{getClientInfo(order)}</div>
                      </td>
                      <td className="border-b border-[var(--color-gray)] px-4 py-3">
                        <span className="font-medium">{parseFloat(order.total_amount).toLocaleString('ru-RU')} ₽</span>
                      </td>
                      <td className="border-b border-[var(--color-gray)] px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getStatusColor(order.status_name)}`}>
                          {order.status_name}
                        </span>
                      </td>
                      <td className="border-b border-[var(--color-gray)] px-4 py-3">
                        {new Date(order.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="border-b border-[var(--color-gray)] px-4 py-3 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Просмотр
                          </button>
                          <button
                            onClick={() => handleEditOrder(order)}
                            className="px-3 py-1 bg-[var(--color-accent)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity"
                            disabled={deleting}
                          >
                            Редактировать
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 border-b border-[var(--color-gray)] text-[var(--color-gray)]">
                      {error || 'Нет данных'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Пагинация */}
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

        {/* Модальное окно просмотра заказа */}
        {viewingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-dark)] p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-accent)]">
                  Просмотр заказа #{viewingOrder.id}
                </h3>
                <button onClick={() => setViewingOrder(null)} className="text-gray-400 hover:text-white focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-[var(--color-gray)] bg-opacity-20 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg text-white mb-3">Клиент</h4>
                  <div className="space-y-2 text-gray-300">
                    <p><strong>Email:</strong> {viewingOrder.client_email}</p>
                    <p><strong>Телефон:</strong> {viewingOrder.client_phone}</p>
                    <p><strong>Юр. адрес:</strong> {viewingOrder.legal_address}</p>
                    {viewingOrder.client_type === 'individual' && viewingOrder.individual_company && (
                      <>
                        <p><strong>ФИО:</strong> {viewingOrder.individual_company}</p>
                        <p><strong>ИНН:</strong> {viewingOrder.individual_inn}</p>
                        <p><strong>ОГРНИП:</strong> {viewingOrder.individual_ogrnip}</p>
                      </>
                    )}
                    {viewingOrder.client_type === 'legal_entity' && viewingOrder.legal_entity_company && (
                      <>
                        <p><strong>Компания:</strong> {viewingOrder.legal_entity_company}</p>
                        <p><strong>ИНН:</strong> {viewingOrder.legal_entity_inn}</p>
                        <p><strong>КПП:</strong> {viewingOrder.legal_entity_kpp}</p>
                        <p><strong>ОГРН:</strong> {viewingOrder.legal_entity_ogrn}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="bg-[var(--color-gray)] bg-opacity-20 p-4 rounded-lg">
                  <h4 className="font-semibold text-lg text-white mb-3">Информация о заказе</h4>
                  <div className="space-y-2 text-gray-300">
                    <p><strong>Дата:</strong> {new Date(viewingOrder.created_at).toLocaleDateString('ru-RU')}</p>
                    <p><strong>Статус:</strong>
                      <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(viewingOrder.status_name)} text-white`}>
                        {viewingOrder.status_name}
                      </span>
                    </p>
                    <p><strong>Сумма:</strong> <span className="font-bold text-green-400">{parseFloat(viewingOrder.total_amount).toLocaleString('ru-RU')} ₽</span></p>
                    {viewingOrder.contract_file && (
                      <p>
                        <strong>Договор:</strong>
                        <a href={`/uploads/contracts/${viewingOrder.contract_file}`} target="_blank" rel="noopener noreferrer" className="ml-2 text-[var(--color-accent)] hover:underline">
                          Посмотреть договор
                        </a>
                      </p>
                    )}
                    {viewingOrder.certificate_file && (
                      <div>
                        <strong>Сертификаты:</strong>
                        <ul className="mt-1 space-y-1">
                          {viewingOrder.certificate_file.split(',').map((cert, index) => (
                            <li key={index}>
                              <a href={`/uploads/certificates/${cert}`} target="_blank" rel="noopener noreferrer" className="text-[var(--color-accent)] hover:underline">
                                Посмотреть сертификат {index + 1}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-[var(--color-gray)] bg-opacity-20 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-lg text-white mb-3">Товары</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[var(--color-gray)]">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Наименование</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Количество</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Цена за ед.</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип упаковки</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Изображение</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Сумма</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-gray)]">
                      {viewingOrder.items?.map((item) => (
                        <tr key={item.product_id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{item.product_name}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{item.quantity} шт.</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{parseFloat(item.unit_price).toLocaleString('ru-RU')} ₽</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                            {item.packaging_type_name || 'Не указано'}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                            {item.packaging_type_image ? (
                              <img src={`/uploads/packaging/${item.packaging_type_image}`} alt="Упаковка" className="w-12 h-12 object-cover rounded" />
                            ) : 'Нет изображения'}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300 font-medium">
                            {(item.quantity * parseFloat(item.unit_price)).toLocaleString('ru-RU')} ₽
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={() => setViewingOrder(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно редактирования заказа */}
        {editingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--color-dark)] p-6 rounded-lg shadow-xl w-full max-w-md">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-2xl font-bold text-[var(--color-accent)]">
                  Редактирование заказа #{editingOrder.id}
                </h3>
                <button onClick={() => setEditingOrder(null)} disabled={loading || deleting} className="text-gray-400 hover:text-white focus:outline-none disabled:opacity-50">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Статус</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(Number(e.target.value) || '')}
                  disabled={loading || deleting}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-white"
                >
                  {statuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">Файл договора</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setNewContract(e.target.files?.[0] || null)}
                  disabled={loading || deleting}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-white disabled:opacity-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[var(--color-accent)] file:text-[var(--color-dark)] hover:file:bg-opacity-90"
                />
                {editingOrder.contract_file && (
                  <div className="mt-3 p-3 bg-gray-700 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-accent)] mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        <path d="M12 7a1 1 0 011 1v4a1 1 0 01-1 1H8a1 1 0 01-1-1V8a1 1 0 011-1h4z" />
                      </svg>
                      <span className="text-sm text-gray-300 truncate max-w-xs">{editingOrder.contract_file}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteContract(editingOrder.id)}
                      disabled={loading || deleting}
                      className="text-red-500 hover:text-red-400 disabled:opacity-50"
                    >
                      Удалить
                    </button>
                  </div>
                )}
              </div>
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">Сертификаты</label>
                <input
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={handleCertificateChange}
                  disabled={loading || deleting}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-white disabled:opacity-50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[var(--color-accent)] file:text-[var(--color-dark)] hover:file:bg-opacity-90"
                />
                {newCertificates.length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs text-gray-400">Выбранные для загрузки:</div>
                    <ul className="mt-1 text-sm text-gray-300 list-disc pl-5">
                      {newCertificates.map((file, index) => (
                        <li key={index}>{file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {editingOrder.certificate_file && (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs text-gray-400">Загруженные сертификаты:</div>
                    {editingOrder.certificate_file.split(',').map((cert, index) => (
                      <div key={index} className="p-2 bg-gray-700 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--color-accent)] mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            <path d="M12 7a1 1 0 011 1v4a1 1 0 01-1 1H8a1 1 0 01-1-1V8a1 1 0 011-1h4z" />
                          </svg>
                          <span className="text-sm text-gray-300 truncate max-w-xs">{cert}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteCertificate(editingOrder.id, cert)}
                          disabled={loading || deleting}
                          className="text-red-500 hover:text-red-400 disabled:opacity-50"
                        >
                          Удалить
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setEditingOrder(null)}
                  disabled={loading || deleting}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  Отмена
                </button>
                <button
                  onClick={handleSaveOrder}
                  disabled={loading || deleting}
                  className="px-4 py-2 bg-[var(--color-accent)] hover:bg-opacity-90 text-[var(--color-dark)] rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Сохранение...
                    </span>
                  ) : "Сохранить изменения"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}