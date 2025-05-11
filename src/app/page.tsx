  'use client'
  import HeroSection from '@/components/common/main/HeroSection';


  import CategoryCatalog from '@/components/common/main/CatalogSection';
  import ProductionTourSection from '@/components/common/main/ProductionTourSection';
  import ProductionFeaturesSection from '@/components/common/main/ProductionFeaturesSection';
  import { PromoSection } from '@/components/common/main/PromoSection';
  import CollaborationStepsSection from '@/components/common/main/CollaborationStepsSection';
  import FaqSection from '@/components/common/main/FaqSection';
  import ContactSection from '@/components/common/main/ContactSection';
  import { CartProvider } from '@/components/CartProvider';
  import Header from '@/components/common/Header';
  import Footer from '@/components/common/Footer';
  import Head from 'next/head'



  export default function HomePage() {
      return (
        <div>
            <Head>
              <title>Пищевые добавки под ваш бренд | OEM производство до -50% | Endorphin</title>
              <meta 
                name="description" 
                content="Производство пищевых добавок под ваш бренд с ценами до -50%. OEM/ODM: BCAA, витамины, омега-3, экстракты. Сертифицированное производство, доставка по России и СНГ. Получите 5% скидку при заказе 300 кг до конца месяца." 
              />
              <meta 
                name="keywords" 
                content="пищевые добавки, OEM производство, BCAA, витамины, омега-3, экстракты, оптовая продажа, сертифицированное производство, доставка по России, СНГ, скидки" 
              />
              <meta property="og:title" content="Пищевые добавки под ваш бренд | OEM производство до -50% " />
              <meta 
                property="og:description" 
                content="Производство пищевых добавок под ваш бренд с ценами до -50%. OEM/ODM: BCAA, витамины, омега-3. Сертификаты, доставка по РФ и СНГ. 5% скидка при заказе 300 кг до конца месяца." 
              />
            </Head>
          <Header />
    
          <main className="text-white cover">
            <HeroSection />
    
            <section className="">
              <CartProvider>
                <CategoryCatalog />
              </CartProvider>
            </section>
    
            <section className="max-w-7xl mx-auto">
              <ProductionTourSection />
            </section>
    
            <section className="max-w-7xl mx-auto">
              <ProductionFeaturesSection />
            </section>
    
            <PromoSection />
    
            <section className="max-w-7xl mx-auto">
              <CollaborationStepsSection />
            </section>
    
            <section className="max-w-7xl mx-auto">
              <FaqSection />
            </section>
    
            <section className="max-w-7xl mx-auto">
              <ContactSection />
            </section>
          </main>
    
          <Footer />
        </div>
      );
    }