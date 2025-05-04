'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Типизация товара в корзине
interface CartItem {
  productId: number;
  packagingId: number | null;
  quantity: number;
}

// Контекст корзины
interface CartContextType {
  cartItems: CartItem[];
  addToCart: (productId: number, packagingId: number | null, quantity: number) => void;
  updateQuantity: (productId: number, packagingId: number | null, quantity: number) => void;
  removeFromCart: (productId: number, packagingId: number | null) => void;
  clearCart: () => void;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Хелперы для работы с куками ---
function getCartFromCookies(): CartItem[] {
  const cartCookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('cart='));

  if (!cartCookie) return [];

  try {
    const parsed = JSON.parse(decodeURIComponent(cartCookie.split('=')[1]));

    // Поддержка старого формата [ ... ] и нового { items: [...] }
    if (Array.isArray(parsed)) return parsed;
    if (parsed && Array.isArray(parsed.items)) return parsed.items;

    return [];
  } catch (e) {
    console.error('Ошибка парсинга корзины из кук:', e);
    return [];
  }
}

function setCartToCookies(cart: CartItem[]) {
  const cookieValue = encodeURIComponent(JSON.stringify({ items: cart }));
  document.cookie = `cart=${cookieValue}; max-age=${60 * 60 * 24 * 7}; path=/`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Загрузка корзины из кук при монтировании
  useEffect(() => {
    const cart = getCartFromCookies();
    setCartItems(cart);
  }, []);

  // Синхронизация состояния с кукой при изменении cartItems
  useEffect(() => {
    setCartToCookies(cartItems);
  }, [cartItems]);

  // Добавление товара в корзину
  const addToCart = (productId: number, packagingId: number | null, quantity: number) => {
    quantity = Math.max(quantity, 200); // минимальное количество

    setCartItems(prev => {
      const updatedCart = [...prev];
      const existingIndex = updatedCart.findIndex(
        item =>
          item.productId === productId &&
          ((item.packagingId === null && packagingId === null) ||
           (item.packagingId !== null && packagingId !== null && item.packagingId === packagingId))
      );

      if (existingIndex > -1) {
        updatedCart[existingIndex].quantity += quantity;
      } else {
        updatedCart.push({ productId, packagingId, quantity });
      }

      return updatedCart;
    });
  };

  // Обновление количества товара
  const updateQuantity = (productId: number, packagingId: number | null, quantity: number) => {
    quantity = Math.max(quantity, 200); // минимальное количество

    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId &&
        ((item.packagingId === null && packagingId === null) ||
         (item.packagingId !== null && packagingId !== null && item.packagingId === packagingId))
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Удаление товара из корзины
  const removeFromCart = (productId: number, packagingId: number | null) => {
    setCartItems(prev =>
      prev.filter(
        item =>
          !(item.productId === productId &&
            ((item.packagingId === null && packagingId === null) ||
             (item.packagingId !== null && packagingId !== null && item.packagingId === packagingId)))
      )
    );
  };

  // Очистка корзины
  const clearCart = () => {
    setCartItems([]);
  };

  // Подсчет общего количества товаров
  const getItemCount = () => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      getItemCount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}