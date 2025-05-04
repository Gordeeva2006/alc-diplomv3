import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin, FiBriefcase } from 'react-icons/fi';

const ContactsPage = () => {
  return (
    <>
      <Header />
      <main className="bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--color-accent)]">
              Контакты
            </h1>
            <p className="text-[var(--color-gray)] text-lg max-w-2xl mx-auto">
              Мы всегда рады помочь вам! Свяжитесь с нами удобным способом или 
              посетите наш офис в Великом Новгороде.
            </p>
          </div>
          <div className="flex gap-8">
            <div className="space-y-8 w-full">
              <section className="bg-dark rounded-xl p-8 shadow-xl">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-[var(--color-accent)]/20 rounded-lg mr-4">
                    <FiPhone className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[var(--color-white)]">Свяжитесь с нами</h2>
                </div>
                
                <div className="space-y-6 pl-14">
                  <div className="flex items-start">
                    <FiPhone className="w-5 h-5 text-[var(--color-gray)] mt-1 mr-4" />
                    <div>
                      <p className="text-[var(--color-gray)] mb-1">Телефон</p>
                      <Link 
                        href="tel:+7XXXXXXXXXX" 
                        className="text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-colors text-lg font-medium"
                      >
                        +7 (XXX) XXX-XX-XX
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FiMail className="w-5 h-5 text-[var(--color-gray)] mt-1 mr-4" />
                    <div>
                      <p className="text-[var(--color-gray)] mb-1">Электронная почта</p>
                      <Link 
                        href="mailto:XXXXX@XXXXX.XXX" 
                        className="text-[var(--color-accent)] hover:text-[var(--color-accent)]/80 transition-colors text-lg font-medium"
                      >
                        XXXXX@XXXXX.XXX
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <FiMapPin className="w-5 h-5 text-[var(--color-gray)] mt-1 mr-4" />
                    <div>
                      <p className="text-[var(--color-gray)] mb-1">Адрес офиса</p>
                      <p className="text-[var(--color-white)] font-medium">
                        XXXXX, X, ул. XXXXXXXXXXX, д. XX, помещ. XX/X/X
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-dark rounded-xl p-8 shadow-xl">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-[var(--color-accent)]/20 rounded-lg mr-4">
                    <FiBriefcase className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[var(--color-white)]">Реквизиты компании</h2>
                </div>

                <div className="space-y-4 pl-14 text-[var(--color-gray)]">
                  <div className="pb-4 border-b border-[var(--color-gray)]/50">
                    <p className="font-medium text-[var(--color-white)] mb-1">Полное наименование</p>
                    <p className="[var(--color-white)]">ООО "XXXXXXXXXX"</p>
                  </div>

                  <div className="pb-4 border-b border-[var(--color-gray)]/50">
                    <p className="font-medium text-[var(--color-white)] mb-1">Юридический адрес</p>
                    <p>XXXXX, X, ул. XXXXXXXXXXX, д. XX, помещ. XX/X/X</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-[var(--color-white)] mb-1">ИНН</p>
                      <p>X0XXXXXXXX</p>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-white)] mb-1">КПП</p>
                      <p>XXXXXXX01</p>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-white)] mb-1">ОГРН</p>
                      <p>X247700550822</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="bg-dark rounded-xl p-8 shadow-xl">
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-[var(--color-accent)]/20 rounded-lg mr-4">
                    <FiBriefcase className="w-6 h-6 text-[var(--color-accent)]" />
                  </div>
                  <h2 className="text-2xl font-semibold text-[var(--color-white)]">Банковские реквизиты</h2>
                </div>

                <div className="space-y-4 pl-14 text-[var(--color-gray)]">
                  <div className="pb-4 border-b border-[var(--color-gray)]/50">
                    <p className="font-medium text-[var(--color-white)] mb-1">Банк</p>
                    <p>АО «XXXXXX»</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-[var(--color-white)] mb-1">БИК</p>
                      <p>XXXXXXX74</p>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-white)] mb-1">ИНН банка</p>
                      <p>XXXXXXX679</p>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-white)] mb-1">Корреспондентский счёт</p>
                      <p>301018XXXXXX50000974</p>
                    </div>
                    <div>
                      <p className="font-medium text-[var(--color-white)] mb-1">Расчётный счёт</p>
                      <p>407028XXXXXXXXXX9725</p>
                    </div>
                  </div>

                  <div>
                    <p className="font-medium text-[var(--color-white)] mb-1">Адрес банка</p>
                    <p>XXXXX, X, ул. XXXXXXXXXXX, д. XXA, стр. XX</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ContactsPage;