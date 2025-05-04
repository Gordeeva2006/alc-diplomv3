'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

// Типизация данных из /api/cart
interface CartItem {
  product_id: number;
  product_name: string;
  packaging_type_id: number | null;
  packaging_name: string | null;
  volume: number | null;
  unit: string | null;
  quantity: number;
  unit_price: number;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Загрузка корзины при монтировании
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

  // Удаление товара из корзины
  const removeFromCart = async (
    productId: number,
    packagingId: number | null
  ) => {
    try {
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          packagingId,
        }),
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

  // Обновление количества товара
  const updateQuantity = async (
    productId: number,
    packagingId: number | null,
    newQuantity: number
  ) => {
    if (newQuantity < 200) {
      alert('Минимальное количество товара — 200 шт.');
      newQuantity = 200;
    }
    try {
      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          packagingId,
          quantity: newQuantity,
        }),
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

  // Оформление заказа
  const handleSubmitOrder = async () => {
    try {
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Не удалось оформить заказ');
      }

      // Успешное оформление заказа
      setIsModalOpen(true); // Открытие модального окна
    } catch (error) {
      console.error('Ошибка оформления заказа:', error);
      alert(error instanceof Error ? error.message : 'Произошла ошибка');
    }
  };

  if (loading)
    return (
      <div>
        <Header />
        <div className="container mx-auto px-4 py-8 min-h-screen">
          Загрузка...
        </div>
        <Footer />
      </div>
    );

  if (cartItems.length === 0) {
    return (
      <div>
        <Header />
        <div className="container mx-auto py-8 min-h-screen max-w-7xl">
          <h1 className="text-3xl font-bold mb-8">Корзина пуста</h1>
          <Link href="/products" className="text-accent hover:underline">
            Перейти к продукции
          </Link>
        </div>
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
    <div>
      <Header />
      <div className="container mx-auto py-8 min-h-screen max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Корзина</h1>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div
              key={`${item.product_id}-${item.packaging_type_id ?? 'none'}`}
              className="flex justify-between items-center border-b pb-4 border-[var(--color-accent)]"
            >
              <div>
                <h2 className="text-xl font-semibold">{item.product_name}</h2>
                {item.packaging_name && item.volume && item.unit && (
                  <p>
                    Упаковка: {item.packaging_name} ({item.volume}
                    {item.unit})
                  </p>
                )}
                <p>Цена за единицу: {item.unit_price.toFixed(2)} ₽</p>
                <p>Количество: {item.quantity}</p>
                <p className="font-bold mt-1">
                  Итого: {(item.unit_price * item.quantity).toFixed(2)} ₽
                </p>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <input
                  type="number"
                  min="200"
                  value={item.quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      updateQuantity(
                        item.product_id,
                        item.packaging_type_id,
                        val
                      );
                    }
                  }}
                  className="w-16 px-2 py-1 border rounded text-center"
                />
                <button
                  onClick={() =>
                    removeFromCart(item.product_id, item.packaging_type_id)
                  }
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
          <div className="mt-6 flex justify-between">
            <span className="text-xl font-bold">Общая сумма:</span>
            <span className="text-xl font-bold">
              {totalAmount.toFixed(2)} ₽
            </span>
          </div>
          {isOrderDisabled && (
            <p className="text-red-600 mt-2">
              Минимальная сумма заказа: 800 000 ₽
            </p>
          )}
          <div className="mt-8">
            <button
              className={`bg-accent text-white px-6 py-3 rounded font-bold ${
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

      {/* Модальное окно */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Заказ оформлен успешно!</h2>
            <div className="flex justify-between">
              <Link 
                href="/orders" 
                className="bg-accent text-white px-4 py-2 rounded hover:bg-opacity-90"
                onClick={() => setIsModalOpen(false)} // Закрытие при переходе
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