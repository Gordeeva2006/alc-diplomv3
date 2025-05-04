'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer'

interface Order {
  id: number;
  total_amount: number;
  status_name: string;
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
  contract_file?: string;
  certificate_file?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [newContract, setNewContract] = useState<File | null>(null);
  const [newCertificates, setNewCertificates] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      const url = new URL('/api/admin/orders', window.location.origin);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('pageSize', pageSize.toString());
      if (statusFilter) url.searchParams.set('status', statusFilter);
      if (searchQuery) url.searchParams.set('search', searchQuery);
      const res = await fetch(url.toString());
      const data = await res.json();
      setOrders(data.data || []);
      setTotal(data.pagination?.total || 0);
    };
    fetchOrders();
  }, [page, pageSize, statusFilter, searchQuery]);

  const getClientInfo = (order: Order) => {
    const common = (
      <div className="text-[var(--color-white)]">
        <div><strong>Email:</strong> {order.client_email}</div>
        <div><strong>Телефон:</strong> {order.client_phone || 'Не указан'}</div>
        <div><strong>Юр. адрес:</strong> {order.legal_address}</div>
      </div>
    );
    if (order.client_type === 'individual' && order.individual_company) {
      return (
        <div>
          {common}
          <div><strong>ФИО:</strong> {order.individual_company}</div>
          <div><strong>ИНН:</strong> {order.individual_inn || 'Не указан'}</div>
          <div><strong>ОГРНИП:</strong> {order.individual_ogrnip || 'Не указан'}</div>
        </div>
      );
    }
    if (order.client_type === 'legal_entity' && order.legal_entity_company) {
      return (
        <div>
          {common}
          <div><strong>Название компании:</strong> {order.legal_entity_company}</div>
          <div><strong>ИНН:</strong> {order.legal_entity_inn || 'Не указан'}</div>
          <div><strong>КПП:</strong> {order.legal_entity_kpp || 'Не указан'}</div>
          <div><strong>ОГРН:</strong> {order.legal_entity_ogrn || 'Не указан'}</div>
        </div>
      );
    }
    return common;
  };

  const handleEditOrder = (order: Order) => {
    setEditingOrder(order);
    setNewStatus(order.status_name);
    setNewContract(null);
    setNewCertificates([]);
  };

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewCertificates(Array.from(e.target.files));
    }
  };

  const handleSaveOrder = async () => {
    if (!editingOrder) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('id', editingOrder.id.toString());
    if (newStatus) formData.append('status', newStatus);
    if (newContract) formData.append('contract', newContract);
    newCertificates.forEach(file => {
      formData.append('certificate_file', file);
    });
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        body: formData
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Не удалось сохранить изменения');
      }
      const updatedOrders = orders.map(order =>
        order.id === editingOrder.id
          ? { ...order, status_name: newStatus }
          : order
      );
      setOrders(updatedOrders);
      setEditingOrder(null);
    } catch (err: any) {
      console.error('Ошибка при сохранении:', err.message);
      alert(err.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const getCertificateLinks = (certs: string) => {
    if (!certs) return 'Нет сертификатов';
    return certs.split(',').map((cert, index) => (
      <div key={index}>
        <a 
          href={`/uploads/certificate_file/${cert}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[var(--color-accent)] underline"
        >
          {cert}
        </a>
      </div>
    ));
  };

  return (
    <div className="bg-[var(--color-dark)] text-[var(--color-white)] min-h-screen">
      <Header />
      <div className='max-w-7xl mx-auto py-12 px-4 min-h-screen'>
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
          >
            {/* Загрузите статусы через /api/admin/statuses */}
            <option value="">Все статусы</option>
            {/* Пример: <option value="1">Новый</option> */}
          </select>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-[var(--color-dark)] border border-[var(--color-gray)]">
            <thead>
              <tr className="bg-[var(--color-gray)]">
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
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">{order.id}</td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">
                      <div className="space-y-1">
                        {getClientInfo(order)}
                      </div>
                    </td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">{order.total_amount}</td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">{order.status_name}</td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="border-b border-[var(--color-gray)] px-4 py-3 text-center">
                      <button
                        onClick={() => handleEditOrder(order)}
                        className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity"
                      >
                        Редактировать
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-6 border-b border-[var(--color-gray)]">
                    Нет данных
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Предыдущая
          </button>
          
          <span className="text-sm">
            Страница {page} из {Math.ceil(total / pageSize)}
          </span>
          
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page * pageSize >= total}
            className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Следующая
          </button>
        </div>
      </div>
      <Footer />

      {/* Модальное окно редактирования */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
          <div className="bg-[var(--color-dark)] p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-[var(--color-accent)]">
              Редактирование заказа #{editingOrder.id}
            </h3>
            
            <div className="mb-4">
              <label className="block mb-2 text-[var(--color-gray)]">Статус</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                {/* Загрузите статусы из /api/admin/statuses */}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 text-[var(--color-gray)]">Файл договора</label>
              <input
                type="file"
                onChange={(e) => setNewContract(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border rounded bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              {editingOrder.contract_file && (
                <a
                  href={`/uploads/contracts/${editingOrder.contract_file}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--color-accent)] underline mt-2 block"
                >
                  Текущий договор: {editingOrder.contract_file}
                </a>
              )}
            </div>
            
            <div className="mb-6">
              <label className="block mb-2 text-[var(--color-gray)]">Загрузите сертификаты (PDF)</label>
              <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={handleCertificateChange}
                className="w-full px-3 py-2 border rounded bg-[var(--color-dark)] text-[var(--color-white)] border-[var(--color-gray)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              />
              {editingOrder.certificate_file && (
                <div className="mt-2">
                  <strong className="text-[var(--color-gray)]">Загруженные сертификаты:</strong>
                  <div className="mt-1 space-y-1">
                    {getCertificateLinks(editingOrder.certificate_file)}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setEditingOrder(null)}
                disabled={loading}
                className="px-4 py-2 bg-[var(--color-gray)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveOrder}
                disabled={loading}
                className="px-4 py-2 bg-[var(--color-accent)] text-[var(--color-dark)] rounded hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}