"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaRegBuilding, FaUserTie, FaEnvelope, FaPhone, FaDownload } from "react-icons/fa";

// Типы данных
interface CartItem {
  product_id: number;
  product_name: string;
  packaging_type_id: number | null;
  packaging_name: string | null;
  packaging_image: string | null;
  quantity: number;
  unit_price: number;
  batch_volume: number;
  price_per_gram: number;
  packaging_volume: number;
  totalPricePerPackage: number;
}

interface Order {
  id: number;
  total_amount: number;
  status_name: string;
  created_at: string;
  legal_address: string;
  contract_file: string | null;
  certificate_file: string | null;
  // Данные клиента
  client_type: 'individual' | 'legal_entity';
  client_email: string;
  client_phone: string | null;
  legal_company: string | null;
  legal_inn: string | null;
  legal_kpp: string | null;
  individual_company: string | null;
  individual_inn: string | null;
  individual_ogrnip: string | null;
  items: CartItem[];
}

interface ModalOrder extends Order {
  isOpen: boolean;
}

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOrder, setModalOrder] = useState<ModalOrder | null>(null);

  // Загрузка данных
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        
        if (res.status === 401) {
          setError("Неавторизован");
          router.push("/login");
          return;
        }
        
        if (!res.ok) throw new Error("Не удалось загрузить список заказов");
        
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Ошибка при загрузке заказов:", err);
        setError("Не удалось загрузить список заказов");
      } finally {
        setLoading(false);
      }
    }
    
    fetchOrders();
  }, [router]);

  // Открытие модального окна
  const openModal = (order: Order) => {
    setModalOrder({
      ...order,
      isOpen: true,
    });
  };

  // Закрытие модального окна
  const closeModal = () => {
    setModalOrder(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Загрузка заказов...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 bg-red-100 text-red-800 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-xl font-bold mb-4">Ошибка</h2>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => router.push("/login")}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-fit max-w-2xl max-h-[80vh] overflow-auto bg-gray-100 rounded-lg shadow-md p-6 text-center">
            <h2 className="text-xl font-bold mb-4">У вас нет заказов</h2>
            <p className="mb-4">Перейдите в каталог, чтобы оформить первый заказ.</p>
            <button
              onClick={() => router.push("/products")}
              className="bg-accent px-6 py-3 rounded hover:bg-accent-dark transition-colors"
            >
              Перейти в каталог
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow ">
          <div className="bg-dark p-6 max-w-7xl rounded-lg shadow-md mt-16 mx-auto">
            <h1 className="text-3xl font-bold mb-6">Мои заявки</h1>
            <table className="w-full mb-6">
              <thead>
                <tr className="border-b border-[var(--color-accent)]">
                  <th className="p-3 text-left">Номер заказа</th>
                  <th className="p-3 text-left">Дата</th>
                  <th className="p-3 text-left">Сумма</th>
                  <th className="p-3 text-left">Статус</th>
                  <th className="p-3 text-left"></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[var(--color-accent)]">
                    <td className="p-3">{order.id}</td>
                    <td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="p-3">{Number(order.total_amount).toFixed(2)} ₽</td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          order.status_name === "Подтверждено"
                            ? "bg-green-100 text-green-800"
                            : order.status_name === "Ждёт подтверждения"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status_name === "Отправлено"
                            ? "bg-blue-100 text-blue-800"
                            : order.status_name === "Завершено"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status_name}
                      </span>
                    </td>
                    <td className="p-1">
                      <button
                        onClick={() => openModal(order)}
                        className="text-white hover:rotate-45 duration-300 transition-all hover:animate-pulse hover:underline decoration-0"
                        aria-label="Детали заявки"
                      >
                        <FaArrowRightLong />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="flex justify-end">
              <Link
                href="/products"
                className="bg-accent px-6 p-3 rounded hover:bg-accent-dark transition-colors"
              >
                Продолжить покупки
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        
        {/* Модальное окно */}
        {modalOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-dark p-6 rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Детали заявки #{modalOrder.id}</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-300 hover:text-white text-3xl"
                  aria-label="Закрыть"
                >
                  &times;
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <FaEnvelope className="mr-2" /> Контактная информация
                  </h3>
                  <p><strong>Email:</strong> {modalOrder.client_email}</p>
                  {modalOrder.client_phone && (
                    <p><strong>Телефон:</strong> {modalOrder.client_phone}</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    {modalOrder.client_type === 'legal_entity' ? (
                      <FaRegBuilding className="mr-2" />
                    ) : (
                      <FaUserTie className="mr-2" />
                    )}
                    {modalOrder.client_type === 'legal_entity' ? 'Юридическое лицо' : 'Индивидуальный предприниматель'}
                  </h3>
                  
                  {modalOrder.client_type === 'legal_entity' ? (
                    <>
                      <p><strong>Наименование:</strong> {modalOrder.legal_company}</p>
                      <p><strong>ИНН:</strong> {modalOrder.legal_inn}</p>
                      <p><strong>КПП:</strong> {modalOrder.legal_kpp}</p>
                    </>
                  ) : (
                    <>
                      <p><strong>Наименование:</strong> {modalOrder.individual_company}</p>
                      <p><strong>ИНН:</strong> {modalOrder.individual_inn}</p>
                      <p><strong>ОГРНИП:</strong> {modalOrder.individual_ogrnip}</p>
                    </>
                  )}
                  
                  <p><strong>Юридический адрес:</strong> {modalOrder.legal_address}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Файлы</h3>
                  {modalOrder.contract_file ? (
                    <div className="mb-2">
                      <Link 
                        href={modalOrder.contract_file}
                        className="text-blue-400 hover:text-blue-300 underline flex items-center"
                        target="_blank"
                        download
                      >
                        <FaDownload className="mr-2" /> Скачать договор
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-400 mb-2">Договор не загружен</p>
                  )}
                  
                  {modalOrder.certificate_file ? (
                    <div>
                      <Link 
                        href={modalOrder.certificate_file} 
                        className="text-blue-400 hover:text-blue-300 underline flex items-center"
                        target="_blank"
                        download
                      >
                        <FaDownload className="mr-2" /> Скачать сертификат
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-400">Сертификат не загружен</p>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-3">Дополнительная информация</h3>
                  <p><strong>Дата создания:</strong> {new Date(modalOrder.created_at).toLocaleString()}</p>
                  <p><strong>Статус:</strong> 
                    <span className={`ml-2 px-3 py-1 rounded-full text-sm ${
                      modalOrder.status_name === "Подтверждено"
                        ? "bg-green-100 text-green-800"
                        : modalOrder.status_name === "Ждёт подтверждения"
                        ? "bg-yellow-100 text-yellow-800"
                        : modalOrder.status_name === "Отправлено"
                        ? "bg-blue-100 text-blue-800"
                        : modalOrder.status_name === "Завершено"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {modalOrder.status_name}
                    </span>
                  </p>
                </div>
              </div>

              <h3 className="text-xl font-semibold mb-4">Товары в заказе</h3>
              
              <div className="overflow-x-auto mb-6">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="py-3 text-left">Товар</th>
                      <th className="py-3 text-left">Упаковка</th>
                      <th className="py-3 text-left">Кол-во</th>
                      <th className="py-3 text-left">Цена за ед.</th>
                      <th className="py-3 text-left">Итого</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalOrder.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-3">
                          {item.product_name}
                        </td>
                        <td className="py-3">
                          {item.packaging_name || "Не указана"} 
                          {item.packaging_volume ? ` (${item.packaging_volume} мл)` : ''}
                        </td>
                        <td className="py-3">{item.quantity}</td>
                        <td className="py-3">{Number(item.unit_price).toFixed(2)} ₽</td>
                        <td className="py-3 font-bold">
                          {(Number(item.unit_price) * item.quantity).toFixed(2)} ₽
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-300">
                      <td colSpan={4} className="py-3 text-right font-semibold">Общая сумма:</td>
                      <td className="py-3 font-bold text-lg">{Number(modalOrder.total_amount).toFixed(2)} ₽</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded transition-colors"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}