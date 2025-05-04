export default function AuthErrorPage() {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Ошибка авторизации</h1>
          <p className="mb-4">Произошла ошибка при входе в систему</p>
          <a 
            href="/login" 
            className="text-[var(--color-accent)] hover:underline"
          >
            Попробовать снова
          </a>
        </div>
      </div>
    )
  }