'use client'
import React, { useState } from 'react';

interface Product {
  id: number;
  title: string;
  url: string;
  image: string;
  oldPrice?: number;
  price: number;
  description: string;
  weight: number;
  categoryId: string;
}

const CategoryFilter: React.FC<{
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}> = ({ activeCategory, setActiveCategory }) => {
  const categories = [
    { id: 'all', title: 'Все товары', href: '/' },
    { id: '1', title: 'Добавки', href: '/bady' },
    { id: '3', title: 'Мерч базы', href: '/odejda-i-aksessuary' },
    { id: '2', title: 'Красота и здоровье', href: '/krasota-i-zdorove' }
  ];

  return (
    <div className="flex overflow-x-auto pb-4 mb-6 scrollbar-hide space-x-2">
      {categories.map((category) => (
        <a
          key={category.id}
          href={category.href}
          className={`flex items-center font-black px-4 py-2 rounded-lg transition-colors
            ${
              activeCategory === category.id
                ? 'bg-[var(--color-accent)] text-[var(--color-white)]'
                : 'bg-dark text-[var(--color-gray)] hover:bg-[var(--color-hover)]'
            }`}
          onClick={(e) => {
            e.preventDefault();
            setActiveCategory(category.id);
          }}
        >
          <div className="text-sm font-medium whitespace-nowrap">
            {category.title}
          </div>
        </a>
      ))}
    </div>
  );
};

const CatalogItem: React.FC<{ product: Product }> = ({ product }) => {
  return (
    <div className="group relative bg-dark rounded-3xl h-full flex flex-col">
      <div className="flex-shrink-0">
        

        <a href={product.url} className="block overflow-hidden rounded-t-3xl">
          <img
            src={product.image}
            alt={product.title}
            className="h-64 w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            width={300}
            height={300}
          />
        </a>
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <a href={product.url} className="text-xl font-medium text-[var(--color-white)] hover:text-[var(--color-accent)] block">
            {product.title}
          </a>
          <p className="text-sm text-[var(--color-gray)] line-clamp-3">{product.description}</p>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            {product.oldPrice && (
              <s className="text-base text-[var(--color-gray-light)]">
                {product.oldPrice.toLocaleString('ru-RU')} руб.
              </s>
            )}
            <div className="text-2xl font-bold text-[var(--color-accent)]">
              {product.price.toLocaleString('ru-RU')} руб.
            </div>
          </div>

          {product.weight > 0 && (
            <div className="text-base text-[var(--color-gray)]">
              Остаток: <span className="font-medium">
                {product.weight.toLocaleString('ru-RU', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 3
                })} кг
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CatalogSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const products: Product[] = [
    {
      id: 29,
      title: 'Креатин',
      url: '/bady/kreatin',
      image: 'https://arsenshop.ru/uploads/webp/uploads/product/000/34/IMG_20250125_165200_920_2025-01-26_15-18-11.webp',
      oldPrice: 3400,
      price: 2100,
      description: 'Заряжает энергией, ускоряет набор мышечной массы, повышает силу и выносливость.',
      weight: 2.5,
      categoryId: '1'
    },
    {
      id: 35,
      title: 'Протеин',
      url: '/bady/protein',
      image: 'https://arsenshop.ru/uploads/webp/uploads/product/000/35/protein-image.webp',
      price: 3500,
      description: 'Высококачественный сывороточный протеин.',
      weight: 3.2,
      categoryId: '1'
    }
  ];

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(product => product.categoryId === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 bg-[var(--color-background)]">
      <CategoryFilter 
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
      
      <div className="flex flex-wrap justify-center gap-6">
        {filteredProducts.map((product) => (
          <div 
            key={product.id}
            className="w-full sm:w-[calc(50%-24px)] md:w-[calc(33.333%-24px)] lg:w-[calc(25%-24px)] flex-shrink-0"
            style={{ maxWidth: '280px' }}
          >
            <CatalogItem product={product} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogSection;