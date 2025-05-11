'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

interface CartItem {
  product_id: number;
  product_name: string;
  packaging_type_id: number | null;
  packaging_name: string | null;
  volume: number | null;
  unit_name: string | null;
  quantity: number;
  unit_price: number;
  packaging_image: string | null;
}

// Функция форматирования цен с пробелами для тысячных разрядов
function formatPrice(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function loadCart() {
      try {
        const res = await fetch('/api/cart');
        if (!res.ok) throw new Error('Не удалось загрузить корзину');
        const data = await res.json();
        setCartItems(data);
      } catch (error) {
        console.error('Ошибка загрузки корзины:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCart();
  }, []);

  const removeFromCart = async (productId: number, packagingId: number | null) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, packagingId }),
      });
      if (!res.ok) throw new Error('Не удалось удалить товар');
      setCartItems(prev =>
        prev.filter(
          item =>
            !(
              item.product_id === productId &&
              ((item.packaging_type_id === null && packagingId === null) ||
               (item.packaging_type_id !== null &&
                packagingId !== null &&
                item.packaging_type_id === packagingId))
            )
        )
      );
    } catch (error) {
      console.error('Ошибка удаления из корзины:', error);
    }
  };

  const adjustQuantity = async (
    productId: number,
    packagingId: number | null,
    newQuantity: number
  ) => {
    // Округляем до ближайшего кратного 50
    newQuantity = Math.round(newQuantity / 50) * 50;

    // Применяем минимальное ограничение
    if (newQuantity < 200) {
      newQuantity = 200;
    }

    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, packagingId, quantity: newQuantity }),
      });

      if (!res.ok) throw new Error('Не удалось обновить количество');

      setCartItems(prev =>
        prev.map(item =>
          item.product_id === productId &&
          ((item.packaging_type_id === null && packagingId === null) ||
           (item.packaging_type_id !== null &&
            packagingId !== null &&
            item.packaging_type_id === packagingId))
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error('Ошибка обновления количества:', error);
    }
  };

  const handleQuantityChange = (
    productId: number,
    packagingId: number | null,
    value: string
  ) => {
    const numValue = parseInt(value);
    setCartItems(prev =>
      prev.map(item =>
        item.product_id === productId &&
        ((item.packaging_type_id === null && packagingId === null) ||
         (item.packaging_type_id !== null &&
          packagingId !== null &&
          item.packaging_type_id === packagingId))
          ? { ...item, quantity: isNaN(numValue) ? 0 : numValue }
          : item
      )
    );
  };

  const validateQuantity = (
    productId: number,
    packagingId: number | null,
    currentQuantity: number
  ) => {
    let newQuantity = currentQuantity;
    if (newQuantity < 200) {
      newQuantity = 200;
    } else {
      newQuantity = Math.round(newQuantity / 50) * 50;
    }

    if (newQuantity !== currentQuantity) {
      adjustQuantity(productId, packagingId, newQuantity);
    }
  };

  const handleSubmitOrder = async () => {
    let hasInvalid = false;
    let updatedCart = [...cartItems];

    for (const item of updatedCart) {
      let newQuantity = item.quantity;
      if (newQuantity < 200) {
        newQuantity = 200;
        hasInvalid = true;
      } else {
        newQuantity = Math.round(newQuantity / 50) * 50;
        if (newQuantity !== item.quantity) {
          hasInvalid = true;
        }
      }

      if (newQuantity !== item.quantity) {
        try {
          const res = await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              productId: item.product_id,
              packagingId: item.packaging_type_id,
              quantity: newQuantity,
            }),
          });

          if (!res.ok) throw new Error('Не удалось обновить количество');
        } catch (error) {
          console.error('Ошибка обновления количества:', error);
        }
        item.quantity = newQuantity;
      }
    }

    if (hasInvalid) {
      setCartItems(updatedCart);
    }

    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Не удалось оформить заказ');
      }

      setIsModalOpen(true);
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      alert(error instanceof Error ? error.message : 'Произошла ошибка');
    }
  };

  if (loading)
    return (
      <div className='flex flex-col min-h-screen'>
        <Header />
        <main className="flex justify-center items-center h-64 flex-grow">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C09D6A]"></div>
        </main>
        <Footer />
      </div>
    );

  if (cartItems.length === 0) {
    return (
      <div className='flex flex-col min-h-screen'>
        <Header />
        <main className='flex-grow'>
          <div className="container mx-auto py-8  max-w-7xl">
            <h1 className="text-3xl text-white font-bold mb-8">Заявка пуста</h1>
            <Link href="/products" className="text-accent hover:underline">
              Перейти к продукции
            </Link>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  const isOrderDisabled = totalAmount < 800000;

  return (
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-grow'>
          <div className="container mx-auto py-8  max-w-7xl">
          <h1 className="text-3xl font-bold mb-8 text-white">Формирование заявки</h1>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <div
                key={`${item.product_id}-${item.packaging_type_id ?? 'none'}`}
                className="bg-dark rounded-lg p-4 mb-4"
              >
                <div className="flex items-start gap-4">
                  {item.packaging_image && (
                    <img
                      src={item.packaging_image}
                      alt={item.packaging_name || 'Упаковка'}
                      className="w-24 h-24 object-cover rounded"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{item.product_name}</h2>
                    {item.packaging_name && item.volume && item.unit_name && (
                      <p>
                        Упаковка: {item.packaging_name} ({item.volume}
                        {item.unit_name})
                      </p>
                    )}
                    <p>Цена за единицу: {formatPrice(item.unit_price)} <span className='text-lg font-light'>₽</span></p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-1 bg-accent/20 p-1 rounded-full text-sm">
                    {/* Кнопки -250 и -50 */}
                    <button
                      onClick={() =>
                        adjustQuantity(
                          item.product_id,
                          item.packaging_type_id,
                          item.quantity - 250
                        )
                      }
                      className="bg-white text-black px-2 py-1 rounded-full hover:bg-gray-200 transition-colors  min-w-[40px]"
                    >
                      -250
                    </button>
                    <button
                      onClick={() =>
                        adjustQuantity(
                          item.product_id,
                          item.packaging_type_id,
                          item.quantity - 50
                        )
                      }
                      className="bg-white text-black px-2 py-1 rounded-full hover:bg-gray-200 transition-colors  min-w-[30px]"
                    >
                      -50
                    </button>

                    {/* Поле ввода количества */}
                    <input
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(
                          item.product_id,
                          item.packaging_type_id,
                          e.target.value
                        )
                      }
                      onBlur={() =>
                        validateQuantity(
                          item.product_id,
                          item.packaging_type_id,
                          item.quantity
                        )
                      }
                      className="w-20 px-3 py-1 bg-accent text-white rounded-full text-center focus:outline-none focus:ring-2 focus:ring-white/50 text-xl"
                    />

                    {/* Кнопки +50 и +250 */}
                    <button
                      onClick={() =>
                        adjustQuantity(
                          item.product_id,
                          item.packaging_type_id,
                          item.quantity + 50
                        )
                      }
                      className="bg-white text-black px-2 py-1 rounded-full hover:bg-gray-200 transition-colors  min-w-[30px]"
                    >
                      +50
                    </button>
                    <button
                      onClick={() =>
                        adjustQuantity(
                          item.product_id,
                          item.packaging_type_id,
                          item.quantity + 250
                        )
                      }
                      className="bg-white text-black px-2 py-1 rounded-full hover:bg-gray-200 transition-colors  min-w-[40px]"
                    >
                      +250
                    </button>
                  </div>

                  <div className="text-right"> 
                    <p className="font-bold text-xl">
                      {formatPrice(item.unit_price)}<span className='text-lg font-light'>₽</span> * {item.quantity}уп. = {formatPrice(item.unit_price * item.quantity)} <span className='text-lg font-light'>₽</span>
                    </p>
                    <button
                      onClick={() =>
                        removeFromCart(item.product_id, item.packaging_type_id)
                      }
                      className="text-red-600 hover:text-red-800 mt-2 text-sm"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="mt-6 flex justify-between text-white">
              <span className="text-xl font-bold">Общая сумма:</span>
              <span className="text-xl font-bold text-accent">
                {formatPrice(totalAmount)} <span className='text-lg font-light'>₽</span>
              </span>
            </div>

            <p className="text-white">
              Информация, представленная на сайте, не является публичной офертой.
              Все цены указаны как предложение для обсуждения и могут быть изменены
              до момента заключения договора.
            </p>

            {isOrderDisabled && (
              <p className="text-red-600 mt-2">
                Минимальная сумма заявки: 800 000 <span className='text-lg font-light'>₽</span>
              </p>
            )}

            <div className="mt-8">
              <button
                className={`bg-accent text-white px-6 py-3 rounded font-bold w-full sm:w-auto ${
                  isOrderDisabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isOrderDisabled}
                onClick={handleSubmitOrder}
              >
                Оформить заявку
              </button>
            </div>
          </div>
        </div>
      </main>
      

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Заказ оформлен успешно!</h2>
            <div className="flex justify-between">
              <Link
                href="/orders"
                className="bg-accent text-white px-4 py-2 rounded hover:bg-opacity-90"
                onClick={() => setIsModalOpen(false)}
              >
                Перейти к заказам
              </Link>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}