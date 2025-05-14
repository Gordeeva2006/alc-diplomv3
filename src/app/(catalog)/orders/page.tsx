"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/common/Header";
import Footer from "@/components/common/Footer";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import { FaRegBuilding, FaUserTie, FaEnvelope, FaPhone, FaDownload } from "react-icons/fa";
import { IMaskInput } from 'react-imask';

// Типы данных (без изменений)
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
  client_type: 'individual' | 'legal_entity';
  client_email: string;
  client_phone: string | null;
  legal_company: string | null;
  legal_inn: string | null;
  legal_kpp: string | null;
  legal_ogrn: string | null;
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

  // Загрузка данных (без изменений)
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.status === 401) {
          setError("Пожалуйста авторизируйстель");
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Не удалось загрузить список заявок");
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Ошибка при загрузке заявок:", err);
        setError("Не удалось загрузить список заявок");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [router]);

  // Открытие/закрытие модального окна (без изменений)
  const openModal = (order: Order) => {
    setModalOrder({
      ...order,
      isOpen: true,
    });
  };

  const closeModal = () => {
    setModalOrder(null);
  };

  // Компоненты для состояний (без изменений)
  const LoadingState = () => (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex justify-center items-center h-64 flex-grow">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C09D6A]"></div>
      </main>
      <Footer />
    </div>
  );

  const ErrorState = ({ error }: { error: string }) => (
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

  const EmptyState = () => (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-fit max-w-2xl max-h-[80vh] overflow-auto bg-gray rounded-lg shadow-md p-6 text-center">
          <h2 className="text-xl text-accent font-bold mb-4">У вас нет заявок</h2>
          <p className="mb-4 text-white">Перейдите в каталог, чтобы оформить первый заказ.</p>
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

  // Рендеринг
  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;
  if (orders.length === 0) return <EmptyState />;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <div className="bg-dark p-4 sm:p-6 max-w-7xl mx-auto rounded-lg shadow-md mt-16">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6">Мои заявки</h1>
          
          {/* Список заказов с адаптивной разметкой */}
          <div className="hidden sm:grid grid-cols-1 md:grid-cols-5 gap-4 mb-6 border-b border-[var(--color-accent)] pb-2 font-semibold text-white">
            <div>Номер</div>
            <div>Дата</div>
            <div>Сумма</div>
            <div>Статус</div>
            <div>Детали</div>
          </div>

          <div className="space-y-4 mb-6">
            {orders.map((order) => (
              <div 
                key={order.id}
                className="bg-dark-lighter rounded-lg overflow-hidden"
              >
                {/* Мобильное представление заказа */}
                <div className="sm:hidden p-4 border-b border-[var(--color-accent)]">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Номер:</span>
                      <span className="font-medium">#{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Дата:</span>
                      <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-400">Сумма:</span>
                      <span className="font-medium">{Number(order.total_amount).toFixed(2)} ₽</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-400">Статус:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
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
                    </div>
                    <div className="pt-2">
                      <button
                        onClick={() => openModal(order)}
                        className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent-dark text-white py-2 px-4 rounded transition-colors"
                      >
                        <span>Подробнее</span>
                        <FaArrowRightLong className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Десктопное представление заказа */}
                <div className="hidden sm:grid grid-cols-1 md:grid-cols-5 gap-4 items-center border-b border-[var(--color-accent)] py-3 px-4">
                  <div>#{order.id}</div>
                  <div>{new Date(order.created_at).toLocaleDateString()}</div>
                  <div>{Number(order.total_amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}{' '}
                  <span className="text-lg font-light">₽</span></div>
                  <div>
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
                  </div>
                  <div>
                    <button
                      onClick={() => openModal(order)}
                      className="text-white hover:rotate-45 duration-300 transition-all hover:animate-pulse hover:underline decoration-0"
                      aria-label="Детали заявки"
                    >
                      <FaArrowRightLong />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <Link
              href="/products"
              className="bg-accent px-6 py-3 rounded hover:bg-accent-dark transition-colors"
            >
              Продолжить покупки
            </Link>
          </div>
        </div>
      </main>
      <Footer />

      {/* Модальное окно с адаптивной разметкой */}
      {modalOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-dark p-4 sm:p-6 rounded-lg shadow-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">Детали заявки #{modalOrder.id}</h2>
              <button
                onClick={closeModal}
                className="text-gray-300 hover:text-white text-3xl"
                aria-label="Закрыть"
              >
                &times;
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <div className="bg-dark-lighter p-4 rounded">
                <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center">
                  <FaEnvelope className="mr-2" /> Контактная информация
                </h3>
                <div className="space-y-1">
                  <p><strong>Email:</strong> {modalOrder.client_email}</p>
                  {modalOrder.client_phone && (
                    <p className="flex items-center">
                      <strong>Телефон:</strong>
                      <IMaskInput
                        mask="+{7}(000)000-00-00"
                        value={modalOrder.client_phone}
                        disabled
                        className="ml-2 bg-transparent border-none text-inherit font-normal focus:outline-none"
                      />
                    </p>
                  )}
                </div>
              </div>
              
              <div className="bg-dark-lighter p-4 rounded">
                <h3 className="text-base sm:text-lg font-semibold mb-3 flex items-center">
                  {modalOrder.client_type === 'legal_entity' ? (
                    <FaRegBuilding className="mr-2" />
                  ) : (
                    <FaUserTie className="mr-2" />
                  )}
                  {modalOrder.client_type === 'legal_entity' ? 'Юридическое лицо' : 'Индивидуальный предприниматель'}
                </h3>
                <div className="space-y-1">
                  {modalOrder.client_type === 'legal_entity' ? (
                    <>
                      <p><strong>Наименование:</strong> {modalOrder.legal_company}</p>
                      <p><strong>ИНН:</strong> {modalOrder.legal_inn}</p>
                      <p><strong>КПП:</strong> {modalOrder.legal_kpp}</p>
                      <p><strong>ОГРН:</strong> {modalOrder.legal_ogrn}</p>
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
              </div>

              <div className="bg-dark-lighter p-4 rounded">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Файлы</h3>
                {modalOrder.contract_file ? (
                  <div className="mb-2">
                    <Link 
                      href={'/uploads/contracts/'+modalOrder.contract_file}
                      className="text-accent hover:text-accent/30 underline flex items-center"
                      target="_blank"
                      download
                    >
                      <FaDownload className="mr-2" /> Скачать договор
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-400 mb-2 text-sm">Договор не загружен</p>
                )}
                {modalOrder.certificate_file ? (
                  <div>
                    <Link 
                      href={'/uploads/certificates/'+modalOrder.certificate_file} 
                      className="text-accent hover:text-accent/30 underline flex items-center"
                      target="_blank"
                      download
                    >
                      <FaDownload className="mr-2" /> Скачать сертификат
                    </Link>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Сертификат не загружен</p>
                )}
              </div>

              <div className="bg-dark-lighter p-4 rounded">
                <h3 className="text-base sm:text-lg font-semibold mb-3">Дополнительная информация</h3>
                <div className="space-y-1">
                  <p><strong>Дата создания:</strong> {new Date(modalOrder.created_at).toLocaleString()}</p>
                  <p className="pt-2"><strong>Статус:</strong> 
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
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
            </div>

            <h3 className="text-xl font-semibold mb-4">Продукция в заявке</h3>
            
            {/* Адаптивная таблица товаров */}
            <div className="overflow-x-auto mb-6">
              <div className="sm:grid grid-cols-1 sm:grid-cols-5 gap-4 border-b border-gray-300 pb-2 mb-2 font-semibold text-sm sm:text-base hidden ">
                <div>Товар</div>
                <div>Упаковка</div>
                <div className="">Изображение</div>
                <div>Кол-во</div>
                <div>Сумма</div>
              </div>
              
              <div className="space-y-4">
                {modalOrder.items.map((item, index) => (
                  <div 
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-5 gap-4 border-b border-gray-200 pb-4 pt-2"
                  >
                    <div className="">
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-sm text-gray-400 sm:hidden">
                        Упаковка: {item.packaging_name || "Не указана"} 
                        {item.packaging_volume ? ` (${item.packaging_volume} мл)` : ''}
                      </div>
                    </div>
                    <div className="sm:hidden">
                      {item.packaging_image && (
                        <img 
                          src={item.packaging_image} 
                          alt={item.packaging_name || "Упаковка"} 
                          className="w-32 h-32 object-cover rounded mx-auto"
                        />
                      )}
                    </div>
                    <div className="sm:col-span-1 hidden sm:block">
                      {item.packaging_name || "Не указана"} 
                      {item.packaging_volume ? ` (${item.packaging_volume} мл)` : ''}
                    </div>
                    <div className="sm:col-span-1 hidden sm:block">
                      {item.packaging_image && (
                        <img 
                          src={item.packaging_image} 
                          alt={item.packaging_name || "Упаковка"} 
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                    </div>
                    <div className="sm:col-span-1"><span className="md:hidden">Кол-во упаковок: </span>{item.quantity} шт.</div>
                    <div className="sm:col-span-1 font-bold">
                      <span className="md:hidden">Цена за партию: </span>{(item.unit_price * item.quantity)
  .toFixed(2)
  .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}{' '}
<span className="text-lg font-light">₽</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center border-t border-gray-300 pt-4 mb-6">
              <div></div>
              <div className="text-right">
                <div className="font-semibold">Общая сумма:</div>
                <div className="text-lg font-bold mt-1">
                  {Number(modalOrder.total_amount).toFixed(2)} <span className='text-lg font-light'>₽</span>
                </div>
              </div>
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

