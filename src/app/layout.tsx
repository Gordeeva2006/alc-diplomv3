import "@/app/globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="stylesheet" href="global.css" />
        <title>Пищевые добавки под вашим брендом | OEM производство | Albumen</title>
        meta:dec
        <meta 
                name="description" 
                content="Производство пищевых добавок под ваш бренд с ценами до -50%. OEM/ODM: BCAA, витамины, омега-3, экстракты. Сертифицированное производство, доставка по России и СНГ. Получите 5% скидку до конца месяца." 
              />
              <meta 
                name="keywords" 
                content="пищевые добавки, OEM производство, BCAA, витамины, омега-3, экстракты, оптовая продажа, сертифицированное производство, доставка по России, СНГ, скидки" 
              />
              <meta property="og:title" content="Пищевые добавки под ваш бренд | OEM производство до -50% " />
              <meta 
                property="og:description" 
                content="Производство пищевых добавок под ваш бренд с ценами до -50%. OEM/ODM: BCAA, витамины, омега-3. Сертификаты, доставка по РФ и СНГ. Получите 5% скидку до конца месяца." 
              />
      </head>
      <body>
        <SessionProviderWrapper>
              {children}
        </SessionProviderWrapper>
      </body>
    </html>
  )
}