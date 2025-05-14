'use client';
import { useEffect, useState, useMemo } from 'react';
import { useCart } from '@/components/CartProvider';
import Image from 'next/image';

interface PackagingOption {
  id: number;
  name: string;
  volume: number;
  unit: string;
  image: string | null;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price_per_gram: number;
  category_name: string;
  form_type_name: string | null;
  packagingOptions: PackagingOption[];
}

const calculatePackagingPrice = (
  pricePerGram: number,
  selectedPackaging: PackagingOption | null,
  quantity: number
): number => {
  if (!selectedPackaging) return 0;
  return pricePerGram * selectedPackaging.volume * quantity;
};

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedPackagings, setSelectedPackagings] = useState<Record<number, number | null>>({});
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [focusedFields, setFocusedFields] = useState<Record<number, boolean>>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeSelectId, setActiveSelectId] = useState<number | null>(null);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const { addToCart } = useCart();

  // Функция для обновления количества с округлением
  const applyRoundedQuantity = (productId: number, value: number) => {
    const adjustedValue = Math.max(200, Math.round(value / 50) * 50);
    setSelectedQuantities(prev => ({
      ...prev,
      [productId]: adjustedValue,
    }));
  };

  // Обработчики фокуса и потери фокуса
  const handleFocus = (productId: number) => {
    setFocusedFields(prev => ({
      ...prev,
      [productId]: true,
    }));
  };

  const handleBlur = (productId: number) => {
    setFocusedFields(prev => ({
      ...prev,
      [productId]: false,
    }));
    applyRoundedQuantity(productId, selectedQuantities[productId]);
  };

  // Изменение количества
  const changeQuantity = (productId: number, delta: number) => {
    const currentQty = selectedQuantities[productId];
    const newQty = Math.max(200, currentQty + delta);
    applyRoundedQuantity(productId, newQty);
  };

  // Добавление товара в корзину
  const handleAddToCart = async (product: Product) => {
    try {
      const selectedPkg = product.packagingOptions.find(pkg => 
        pkg.id === selectedPackagings[product.id]
      ) || product.packagingOptions[0];
      const quantity = selectedQuantities[product.id];
      if (!selectedPkg || quantity <= 0) {
        throw new Error('Некорректные параметры Продукции');
      }
      const price = calculatePackagingPrice(
        product.price_per_gram,
        selectedPkg,
        quantity
      );
      // ✅ Передача трёх аргументов вместо объекта
      await addToCart(product.id, selectedPkg.id, quantity);
      setModalMessage('Товар добавлен в корзину');
      setIsModalOpen(true);
      setTimeout(() => setIsModalOpen(false), 3000);
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      setModalMessage('Не удалось добавить товар. Пожалуйста, попробуйте позже.');
      setIsModalOpen(true);
      setTimeout(() => setIsModalOpen(false), 3000);
    }
  };

  // Функция для случайной сортировки
  const shuffleArray = (array: Product[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Фильтрация товаров по категории с ограничением до 6 случайных
  const filteredProducts = useMemo(() => {
    const filtered = products.filter(product => {
      const matchesCategory = !selectedCategory || product.category_name === selectedCategory;
      return matchesCategory;
    });
    
    const shuffled = shuffleArray(filtered);
    return shuffled.slice(0, 6);
  }, [products, selectedCategory]);

  // Показ изображения при наведении
  const handleShowImage = (productId: number) => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    setActiveSelectId(productId);
  };

  // Скрытие изображения с задержкой
  const handleHideImage = (productId: number) => {
    const timer = setTimeout(() => {
      setActiveSelectId(null);
    }, 300);
    setHideTimeout(timer);
  };

  // Загрузка данных
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Не удалось загрузить Продукцию');
        const data = await res.json();
        setProducts(data);
        const uniqueCategories = Array.from(
          new Set(data.map((p: Product) => p.category_name))
        ) as string[];
        setCategories(uniqueCategories);
        const initialQuantities = data.reduce((acc: Record<number, number>, product: Product) => {
          acc[product.id] = Math.max(200, product.packagingOptions[0]?.volume || 200);
          return acc;
        }, {});
        setSelectedQuantities(initialQuantities);
      } catch (err) {
        console.error('Ошибка загрузки товаров:', err);
        setError('Не удалось загрузить Продукцию. Попробуйте перезагрузить страницу.');
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
    };
  }, [hideTimeout]);

  // Рендеринг
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C09D6A]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className='flex flex-col '>
      <div className="container mx-auto py-8 max-w-7xl flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-white">Каталог продукции</h1>
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full text-sm transition-colors ${
                selectedCategory === null
                  ? 'bg-[#C09D6A] text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-[#f5f0ec]'
              }`}
            >
              Все
            </button>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-[#C09D6A] text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-[#f5f0ec]'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.length > 0 ? (
            filteredProducts.map(product => {
              const selectedPackaging = product.packagingOptions.find(pkg => 
                pkg.id === selectedPackagings[product.id]
              ) || product.packagingOptions[0];
              const totalPrice = calculatePackagingPrice(
                product.price_per_gram,
                selectedPackaging,
                selectedQuantities[product.id]
              );
              return (
                <div 
                  key={product.id} 
                  className="bg-dark rounded-lg shadow-md p-4 transition-shadow hover:shadow-lg relative"
                >
                  <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                  <p className="text-gray-400 mb-4">{product.description}</p>
                  <div className="space-y-3 mb-2">
                    {product.packagingOptions.length > 0 && (
                      <div 
                        className="relative"
                        onMouseEnter={() => handleShowImage(product.id)}
                        onMouseLeave={() => handleHideImage(product.id)}
                        onTouchStart={() => handleShowImage(product.id)}
                        onTouchEnd={() => handleHideImage(product.id)}
                      >
                        <select 
                          className="w-full border border-[#C09D6A] rounded p-2 focus:outline-none focus:ring-3 focus:ring-[#C09D6A] transition-all"
                          onChange={(e) => setSelectedPackagings({
                            ...selectedPackagings,
                            [product.id]: Number(e.target.value)
                          })}
                          value={selectedPackagings[product.id] || product.packagingOptions[0]?.id || ''}
                        >
                          {product.packagingOptions.map(pkg => (
                            <option className='text-black' key={pkg.id} value={pkg.id}>
                              {pkg.name} ({pkg.volume}{pkg.unit})
                            </option>
                          ))}
                        </select>
                        {activeSelectId === product.id && selectedPackaging?.image && (
                          <div className="absolute top-12 left-0 w-48 h-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                            <Image
                              src={selectedPackaging.image || '/placeholder.jpg'}
                              alt={selectedPackaging.name}
                              width={192}
                              height={192}
                              className="w-full h-full object-cover"
                              unoptimized
                            />
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex flex-row gap-1 w-2/6">
                        <button
                          onClick={() => changeQuantity(product.id, -250)}
                          className="w-1/3 h-10 bg-white text-black rounded-full hover:bg-gray-300 transition-colors"
                          title="-250"
                        >
                          -250
                        </button>
                        <button
                          onClick={() => changeQuantity(product.id, -50)}
                          className="w-1/3 h-10 bg-white text-black rounded-full hover:bg-gray-300 transition-colors"
                          title="-50"
                        >
                          -50
                        </button>
                      </div>
                      <input
                        type="number"
                        min="200"
                        value={selectedQuantities[product.id]}
                        onChange={(e) => {
                          const newValue = parseInt(e.target.value) || 0;
                          applyRoundedQuantity(product.id, newValue);
                        }}
                        onFocus={() => handleFocus(product.id)}
                        onBlur={() => handleBlur(product.id)}
                        className="w-20 text-center font-extrabold bg-[#C09D6A] rounded-full p-2 focus:outline-none"
                      />
                      <div className="flex justify-end flex-row gap-1 w-2/6">
                        <button
                          onClick={() => changeQuantity(product.id, 50)}
                          className="w-1/3 h-10 bg-white text-black rounded-full hover:bg-gray-300 transition-colors"
                          title="+50"
                        >
                          +50
                        </button>
                        <button
                          onClick={() => changeQuantity(product.id, 250)}
                          className="w-1/3 h-10 bg-white text-black rounded-full hover:bg-gray-300 transition-colors"
                          title="+250"
                        >
                          +250
                        </button>
                      </div>
                    </div>
                    <div className="mt-1">
                      <p className="font-light text-base text-white">
                        <span className='font-bold'>Сумма за партию: </span>
                        {totalPrice.toLocaleString()} <span className='text-lg font-light'>₽</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-[#C09D6A] text-white px-4 py-4 rounded-full hover:bg-[#8a693a] transition-colors"
                  >
                    Добавить в заявку
                  </button>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              Продукция не найдена
            </div>
          )}
        </div>
      </div>
      {isModalOpen && (
          <div 
            className="fixed bottom-4 left-0 right-0 z-50 animate-fadeIn"
            style={{ animationDuration: '0.3s' }}
          >
            <div className="flex justify-center">
              <div className="bg-[#C09D6A] p-6 rounded-lg shadow-white/30 text-center max-w-sm mx-auto transform transition-all animate__animated animate__fadeInUp">
                <p className="text-xl font-bold text-white">{modalMessage}</p>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}