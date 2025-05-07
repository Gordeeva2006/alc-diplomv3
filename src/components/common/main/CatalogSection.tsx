'use client';
import { useEffect, useState } from 'react';
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

export default function CatalogSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedPackagings, setSelectedPackagings] = useState<Record<number, number | null>>({});
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const [focusedFields, setFocusedFields] = useState<Record<number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeSelectId, setActiveSelectId] = useState<number | null>(null);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);

  const { addToCart } = useCart();

  // Загрузка товаров
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        // 🔥 Ограничиваем вывод до 6 товаров здесь
        const limitedData = data.slice(0, 6);
        setProducts(limitedData);

        const uniqueCategories = Array.from(new Set(limitedData.map((p: Product) => p.category_name)));
        setCategories(uniqueCategories);

        const initialQuantities = limitedData.reduce((acc: Record<number, number>, product: Product) => {
          acc[product.id] = 200;
          return acc;
        }, {});

        setSelectedQuantities(initialQuantities);
      });
  }, []);

  // Установка количества без округления
  const setRawQuantity = (productId: number, value: number) => {
    setSelectedQuantities({
      ...selectedQuantities,
      [productId]: value,
    });
  };

  // Применение округления при потере фокуса
  const applyRoundedQuantity = (productId: number, value: number) => {
    const adjustedValue = Math.max(200, Math.round(value / 50) * 50);
    setSelectedQuantities({
      ...selectedQuantities,
      [productId]: adjustedValue,
    });
  };

  // Обработчики фокуса
  const handleFocus = (productId: number) => {
    setFocusedFields({
      ...focusedFields,
      [productId]: true,
    });
  };

  const handleBlur = (productId: number) => {
    setFocusedFields({
      ...focusedFields,
      [productId]: false,
    });
    applyRoundedQuantity(productId, selectedQuantities[productId]);
  };

  // Изменение количества
  const changeQuantity = (productId: number, delta: number) => {
    const newQty = selectedQuantities[productId] + delta;
    applyRoundedQuantity(productId, newQty);
  };

  // Добавление в корзину
  const handleAddToCart = async (product: Product) => {
    const selectedPkg = product.packagingOptions.find(pkg => 
      pkg.id === selectedPackagings[product.id]
    ) || product.packagingOptions[0];

    const quantity = selectedQuantities[product.id];
    const price = calculatePackagingPrice(
      product.price_per_gram,
      selectedPkg,
      quantity
    );

    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          packagingId: selectedPkg.id,
          quantity,
          price
        }),
      });

      if (!res.ok) throw new Error('Не удалось добавить товар');
      alert('✅ Товар добавлен в корзину');
    } catch (error) {
      console.error('Ошибка добавления в корзину:', error);
      alert('❌ Не удалось добавить товар');
    }
  };

  // Фильтрация товаров
  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category_name === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Функции для отображения изображения упаковки
  const handleShowImage = (productId: number) => {
    clearTimeout(hideTimeout);
    setActiveSelectId(productId);
  };

  const handleHideImage = (productId: number) => {
    const timer = setTimeout(() => {
      setActiveSelectId(null);
    }, 300);
    setHideTimeout(timer);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Популярные товары</h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center">
        <input
          type="text"
          placeholder="Поиск по названию..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-1/2 border border-[#C09D6A] rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#C09D6A]"
        />

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm ${
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
              className={`px-4 py-2 rounded-full text-sm ${
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
        {filteredProducts.map(product => {
          const selectedPackaging = product.packagingOptions.find(pkg => 
            pkg.id === selectedPackagings[product.id]
          ) || product.packagingOptions[0];

          return (
            <div
              key={product.id}
              className="bg-dark rounded-lg shadow-md p-4 transition-shadow hover:shadow-lg"
            >
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-400 mb-4">{product.description}</p>

              <div className="space-y-3 mb-4">
                {product.packagingOptions.length > 0 && (
                  <div
                    className="relative"
                    onMouseEnter={() => handleShowImage(product.id)}
                    onMouseLeave={() => handleHideImage(product.id)}
                    onTouchStart={() => handleShowImage(product.id)}
                    onTouchEnd={() => handleHideImage(product.id)}
                  >
                    <select
                      className="w-full border border-[#C09D6A] rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#C09D6A] transition-all"
                      onChange={(e) =>
                        setSelectedPackagings({
                          ...selectedPackagings,
                          [product.id]: Number(e.target.value)
                        })
                      }
                      value={selectedPackagings[product.id] || product.packagingOptions[0]?.id || ''}
                    >
                      {product.packagingOptions.map(pkg => (
                        <option key={pkg.id} value={pkg.id}>
                          {pkg.name} ({pkg.volume}{pkg.unit})
                        </option>
                      ))}
                    </select>

                    {/* Показываем изображение упаковки при наведении */}
                    {activeSelectId === product.id && selectedPackaging?.image && (
                      <div className="absolute top-12 left-0 w-48 h-48 bg-white rounded-lg shadow-lg overflow-hidden z-50">
                        <Image
                          src={selectedPackaging.image}
                          alt={selectedPackaging.name}
                          width={192}
                          height={192}
                          className="w-full h-full object-cover"
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
                    onChange={(e) =>
                      setRawQuantity(product.id, parseInt(e.target.value) || 0)
                    }
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
                  <p className="font-light text-sm text-white">
                    Сумма за партию: 
                    {calculatePackagingPrice(
                      product.price_per_gram,
                      selectedPackaging,
                      selectedQuantities[product.id]
                    ).toLocaleString()} ₽
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
        })}
      </div>
    </div>
  );
}