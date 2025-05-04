// app/layout.tsx
import { CartProvider } from '@/components/CartProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}