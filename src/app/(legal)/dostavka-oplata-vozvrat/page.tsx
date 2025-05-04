import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import Link from 'next/link';

const PaymentDeliveryPage = () => {
  return (
    <>
      <Header />
      <main className="bg-dark leading-6">
        <div className="max-w-7xl mx-auto ">
          <h1 className="text-4xl font-bold text-center mb-12 text-[var(--color-white)]">
            Оплата и доставка
          </h1>
          
          <div className="space-y-12">
            {/* Оплата */}
            <div className="space-y-6 bg-dark rounded-xl p-8 shadow-xl">
              <h3 className="text-xl font-medium text-[var(--color-white)]">Оплата</h3>
              <div className="space-y-3 ">
                <p>Оплатить заказ можно банковской картой на сайте. К оплате принимаются:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li className=" p-3 rounded-lg">
                    VISA Inc
                  </li>
                  <li className=" p-3 rounded-lg">
                    MasterCard WorldWide
                  </li>
                  <li className=" p-3 rounded-lg">
                    МИР
                  </li>
                </ul>
                <p className="mt-4">
                  Для оформления заказа за пределами России, пожалуйста, свяжитесь со 
                  <a href="tg://resolve?domain=XXXXXXXXXX" className="text-[var(--color-accent)] hover:underline ml-1">
                    службой заботы в Telegram
                  </a>.
                </p>
                <div className="bg-dark/50 p-4 rounded-lg mt-4">
                  <p>Платежи и персональные данные полностью защищены</p>
                  <p>Безопасность обработки интернет-платежей через платежный шлюз банка гарантирована международным сертификатом безопасности PCI DSS</p>
                </div>
              </div>
            </div>

            {/* Отправка заказа */}
            <div className="space-y-6 bg-dark rounded-xl p-8 shadow-xl">
              <h3 className="text-xl font-medium text-[var(--color-white)]">Отправка заказа</h3>
              <div className="space-y-3 ">
                <p>Заказ отправляется после 100% предоплаты</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li className=" p-3 rounded-lg">
                    Все заказы отправляются только при полной комплектации
                  </li>
                  <li className=" p-3 rounded-lg">
                    Частичные заказы не отправляются
                  </li>
                  <li className=" p-3 rounded-lg">
                    При отсутствии товара заказ отправляется после полной комплектации
                  </li>
                </ul>
                <div className="bg-dark/50 p-4 rounded-lg mt-4">
                  <p>Заказ будет скомплектован и передан в службу доставки в течение 3 рабочих дней</p>
                  <p>При оформлении в выходной день - комплектация начнется в первый рабочий день</p>
                </div>
              </div>
            </div>

            {/* Доставка */}
            <div className="space-y-6 bg-dark rounded-xl p-8 shadow-xl">
              <h3 className="text-xl font-medium text-[var(--color-white)]">Доставка</h3>
              <div className="space-y-3 ">
                <p>Доставка по России и СНГ осуществляется через СДЭК:</p>
                <ul className="list-disc ml-6 space-y-2">
                  <li className=" p-3 rounded-lg">
                    Сроки: 2-5 дней по РФ, 7-14 дней по СНГ
                  </li>
                  <li className=" p-3 rounded-lg">
                    Стоимость рассчитывается автоматически при оформлении
                  </li>
                  <li className=" p-3 rounded-lg">
                    Все отправления застрахованы
                  </li>
                </ul>
                <div className="bg-[var(--color-accent)]/20 p-4 rounded-lg mt-4">
                  <p className="font-medium">Важно!</p>
                  <p>Проверяйте заказ при получении. Страховка не действует при получении без проверки</p>
                </div>
              </div>
            </div>

            {/* Возврат */}
            <div className="space-y-6 bg-dark rounded-xl p-8 shadow-xl">
              <h3 className="text-xl font-medium text-[var(--color-white)]">Возврат и обмен</h3>
              <div className="space-y-3 ">
                <div className="space-y-2">
                  <p className="font-medium">Товары надлежащего качества:</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li className=" p-3 rounded-lg">
                      Пищевая продукция не подлежит возврату (ст. 25 ФЗ)
                    </li>
                    <li className=" p-3 rounded-lg">
                      Одежда: возврат в 7 дней при сохранении товарного вида (ст. 26.1 ФЗ)
                    </li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">Товары ненадлежащего качества:</p>
                  <ul className="list-disc ml-6 space-y-2">
                    <li className=" p-3 rounded-lg">
                      Возмещаем 100% расходов на обратную доставку
                    </li>
                    <li className=" p-3 rounded-lg">
                      Обращайтесь в службу поддержки для оформления
                    </li>
                  </ul>
                </div>
                <p className="mt-4">Адрес для возврата: XXXXX, X, ул. XXXXXXXXXXX, д. XX, стр. XX</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default PaymentDeliveryPage;