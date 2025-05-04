'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { useCart } from '@/components/CartProvider';

// Типы данных
interface PackagingOption {
  id: number;
  name: string;
  volume: number;
  unit: string;
  image: string | null; // Поле изображения
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

// Функция расчета цены
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
  const [selectedPackagings, setSelectedPackagings] = useState<Record<number, number | null>>({});
  const [selectedQuantities, setSelectedQuantities] = useState<Record<number, number>>({});
  const { addToCart } = useCart();

  // Инициализация данных
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        const initialQuantities = data.reduce((acc: Record<number, number>, product: Product) => {
          acc[product.id] = 200;
          return acc;
        }, {});
        setSelectedQuantities(initialQuantities);
      });
  }, []);

  // Обработчик изменения количества
  const handleQuantityChange = (productId: number, quantity: number) => {
    setSelectedQuantities({
      ...selectedQuantities,
      [productId]: Math.max(200, quantity),
    });
  };

  // Обработчик добавления в корзину
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

  return (
    <div>
      <Header />
      <div className="container mx-auto px-4 py-8 min-h-screen max-w-7xl">
        <h1 className="text-3xl font-bold mb-8">Каталог продукции</h1>
        <div className="flex flex-col md:flex-row flex-wrap gap-6">
          {products.map(product => {
            const selectedPackaging = product.packagingOptions.find(pkg => 
              pkg.id === selectedPackagings[product.id]
            ) || product.packagingOptions[0];

            return (
              <div key={product.id} className="bg-dark rounded-lg shadow-md p-4 transition-shadow hover:shadow-lg w-full md:w-[calc(33%-1rem)]">
                <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                <p className="text-gray mb-4">{product.description}</p>
                <div className="space-y-3 mb-2">
                  {product.packagingOptions.length > 0 && (
                    <>
                      <select 
                        className="w-full border border-[#C09D6A] rounded p-2 focus:outline-none focus:ring-3 focus:ring-[#C09D6A] transition-all"
                        onChange={(e) => setSelectedPackagings({
                          ...selectedPackagings,
                          [product.id]: Number(e.target.value)
                        })}
                        value={selectedPackagings[product.id] || product.packagingOptions[0]?.id}
                      >
                        {product.packagingOptions.map(pkg => (
                          <option key={pkg.id} value={pkg.id}>
                            {pkg.name} ({pkg.volume}{pkg.unit})
                          </option>
                        ))}
                      </select>
                      
                      {/* Отображение изображения */}
                      {selectedPackaging && selectedPackaging.image && (
                        <div className="mt-3">
                          <img 
                            src={`${selectedPackaging.image}`} 
                            alt={selectedPackaging.name} 
                            className="w-full h-auto rounded object-cover"
                          />
                        </div>
                      )}
                    </>
                  )}
                  <input
                    type="number"
                    min="200"
                    value={selectedQuantities[product.id]}
                    onChange={(e) => handleQuantityChange(product.id, parseInt(e.target.value))}
                    className="w-full border border-[#C09D6A] rounded p-2 focus:outline-none focus:ring-2 focus:ring-[#C09D6A] duration-300 transition-all"
                  />
                  {/* Отображение цены */}
                  <div className="mt-1">
                    <p className="font-light text-base text-white">
                      <span className='font-bold'>Сумма за партию: </span>
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
      <Footer />
    </div>
  );
}