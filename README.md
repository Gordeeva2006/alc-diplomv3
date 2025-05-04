src/
├── app/                   # Основные маршруты (App Router)
│   ├── (auth)/           # Группа аутентификации
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── profile/
│   │       └── page.tsx
│   ├── (dashboard)/       # Группа админки
│   │   ├── layout.tsx     # Кастомный layout для админки
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── products/
│   │       └── page.tsx
│   ├── (catalog)/         # Группа каталога
│   │   ├── products/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── packaging/
│   │       └── [id]/
│   │           └── page.tsx
│   ├── api/               # API-роуты
│   │   ├── auth/
│   │   │   └── route.ts
│   │   └── orders/
│   │       └── route.ts
│   ├── errors/
│   │   ├── error.tsx      # Глобальный обработчик ошибок
│   │   ├── not-found.tsx  # 404
│   │   └── loading.tsx    # Состояние загрузки
│   ├── layout.tsx         # Корневой layout
│   ├── page.tsx           # Главная страница
│   └── template.tsx       # Шаблон для динамических страниц
│
├── components/            # Переиспользуемые компоненты
│   ├── auth/              # Формы авторизации
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── common/            # Глобальные элементы
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── ChatWidget.tsx
│   ├── dashboard/         # Компоненты админки
│   │   ├── OrderTable.tsx
│   │   └── UserManagement.tsx
│   └── product/           # Компоненты товаров
│       ├── ProductCard.tsx
│       └── CatalogFilter.tsx
│
├── services/              # API-сервисы
│   ├── auth.service.ts
│   └── order.service.ts
│
├── lib/                   # Утилиты
│   ├── db.ts              # Подключение к БД
│   └── auth.ts            # Логика аутентификации
│
├── hooks/                 # Кастомные хуки
│   ├── use-cart.ts
│   └── use-orders.ts
│
