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




export default function HomePage() {
    return (
      <div>
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