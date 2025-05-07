'use client';
import { useEffect, useState } from 'react';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';

interface Packing {
  id: number;
  name: string;
  materialName: string | null;
  volume: number;
  unitName: string | null;
  image: string | null;
}

export default function PackingsPage() {
  const [packings, setPackings] = useState<Packing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackings = async () => {
      try {
        const res = await fetch('/api/packings');
        if (!res.ok) throw new Error('Failed to fetch packings');
        const data = await res.json();
        setPackings(data);
      } catch (err) {
        setError('Ошибка загрузки данных об упаковках');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPackings();
  }, []);

  if (isLoading) return <div className="p-6 text-gray-500">Загрузка...</div>;
  if (error) return <div className="p-6 text-error">{error}</div>;

  return (
    <div className="min-h-screen bg-dark">
      <Header />
      <div className='topo_bg'>
        <div className="max-w-7xl mx-auto py-8 container topo_bg">
            <h1 className="text-3xl font-bold mb-8 text-white">Каталог упаковок</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {packings.map((packing) => (
                <div 
                  key={packing.id} 
                  className="bg-dark rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
                >
                  <div className="relative w-full h-48">
                    {packing.image ? (
                      <img 
                        src={packing.image} 
                        alt={packing.name}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Нет изображения</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold mb-2 text-accent">{packing.name}</h2>
                    <div className="space-y-1 text-sm text-white">
                      <p><span className="text-gray-500 font-extralight">Материал:</span> {packing.materialName || '-'}</p>
                      <p><span className="text-gray-500 font-extralight">Объем:</span> {packing.volume.toFixed(2)} {packing.unitName || '-'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
      </div>
        
      <Footer />
    </div>
  );
}