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
      </head>
      <body>
        <SessionProviderWrapper>
          
              {children}
          
        </SessionProviderWrapper>
      </body>
    </html>
  )
}