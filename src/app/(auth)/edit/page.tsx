"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Footer from '@/components/common/Footer';
import { CartProvider } from '@/components/CartProvider';

interface ProfileData {
  userType: 'individual' | 'legal_entity';
  companyName: string;
  inn: string;
  ogrn: string;
  ogrnip: string;
  kpp: string;
  legalAddress: string;
  email: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EditProfilePage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ProfileData>({
    userType: 'individual',
    companyName: '',
    inn: '',
    ogrn: '',
    ogrnip: '',
    kpp: '',
    legalAddress: '',
    email: '',
    phone: ''
  });
  
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState<Partial<ProfileData & PasswordForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) throw new Error('Ошибка загрузки профиля');
        const data = await response.json();
        setFormData({
          userType: data.userType,
          companyName: data.companyName,
          inn: data.inn,
          ogrn: data.ogrn || '',
          ogrnip: data.ogrnip || '',
          kpp: data.kpp || '',
          legalAddress: data.legalAddress,
          email: data.email,
          phone: data.phone
        });
      } catch (error) {
        setErrors({ form: 'Не удалось загрузить данные профиля' });
      }
    };
    loadProfile();
  }, []);

  const validateProfile = (): boolean => {
    const newErrors: Partial<ProfileData> = {};
    if (!formData.companyName) newErrors.companyName = 'Введите название компании';
    if (!formData.phone) newErrors.phone = 'Введите номер телефона';
    if (!formData.email) newErrors.email = 'Введите email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }
    if (!formData.legalAddress) newErrors.legalAddress = 'Введите юридический адрес';
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const validatePassword = (): boolean => {
    const newErrors: Partial<PasswordForm> = {};
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{9,}$/;
    
    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Введите текущий пароль';
    }
    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'Введите новый пароль';
    } else if (!strongPasswordRegex.test(passwordForm.newPassword)) {
      newErrors.newPassword = 'Пароль должен содержать: минимум 9 символов, заглавные/строчные латинские буквы, цифры и спецсимволы';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают';
    }
    
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: formData.userType,
          companyName: formData.companyName,
          legalAddress: formData.legalAddress,
          email: formData.email,
          phone: formData.phone
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка обновления профиля');
      }
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error: any) {
      setErrors({ ...errors, form: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка изменения пароля');
      }
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordSuccess(true);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (error: any) {
      setErrors({ ...errors, password: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/user/delete', { method: 'DELETE' });
      if (response.ok) {
        document.cookie = 'token=; Max-Age=0; Path=/;';
        router.push('/');
      }
    } catch (error) {
      setErrors({ form: 'Ошибка удаления профиля' });
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
              <CartProvider>
             <Header />
        </CartProvider>
        <div className="max-w-7xl mx-auto">
          <div className="bg-dark p-8 rounded-lg shadow-md w-full flex space-y-6 h-160">
            <div className=''>
                  <h2 className="text-2xl font-bold text-center text-white pb-6">
                    Редактирование профиля
                  </h2>
                  {/* Форма профиля */}
                  <form onSubmit={handleSubmitProfile} className="space-y-4 mx-15">
                    {/* Тип пользователя (заблокирован) */}
                    <select 
                      value={formData.userType}
                      disabled
                      className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)] opacity-70 cursor-not-allowed"
                    >
                      <option value="individual">Индивидуальный предприниматель</option>
                      <option value="legal_entity">Юридическое лицо</option>
                    </select>
                    
                    {/* Общие поля */}
                    <input 
                      type="text"
                      placeholder="Название компании"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    {errors.companyName && <p className="text-red-500 text-sm mt-1">{errors.companyName}</p>}
                    
                    <input 
                      type="tel"
                      placeholder="Номер телефона"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                    
                    <input 
                      type="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    
                    {/* Поля для юрлица */}
                    {formData.userType === 'legal_entity' && (
                      <>
                        <input 
                          type="text"
                          placeholder="Юридический адрес"
                          value={formData.legalAddress}
                          onChange={(e) => setFormData({ ...formData, legalAddress: e.target.value })}
                          className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                        />
                        {errors.legalAddress && <p className="text-red-500 text-sm mt-1">{errors.legalAddress}</p>}
                        
                        <input 
                          type="text"
                          placeholder="ОГРН"
                          value={formData.ogrn}
                          disabled
                          className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)] opacity-70 cursor-not-allowed"
                        />
                        
                        <input 
                          type="text"
                          placeholder="КПП"
                          value={formData.kpp}
                          disabled
                          className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)] opacity-70 cursor-not-allowed"
                        />
                      </>
                    )}
                    
                    {/* Поля для ИП */}
                    {formData.userType === 'individual' && (
                      <>
                      <input 
                          type="text"
                          placeholder="Юридический адрес"
                          value={formData.legalAddress}
                          onChange={(e) => setFormData({ ...formData, legalAddress: e.target.value })}
                          className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                        />
                        {errors.legalAddress && <p className="text-red-500 text-sm mt-1">{errors.legalAddress}</p>}
                      <input 
                          type="text"
                          placeholder="ИНН"
                          value={formData.inn}
                          disabled
                          className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)] opacity-70 cursor-not-allowed"
                        />
                        <input 
                          type="text"
                          placeholder="ОГРНИП"
                          value={formData.ogrnip}
                          disabled
                          className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)] opacity-70 cursor-not-allowed"
                        />
                      </>
                    )}
                    
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-[var(--color-accent)] text-white py-2 px-4 rounded transition ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-90'
                      }`}
                    >
                      {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
                    </button>
                    
                    {isSuccess && <p className="text-green-500 text-sm text-center">Изменения успешно сохранены!</p>}
                    {errors.form && <p className="text-red-500 text-sm text-center">{errors.form}</p>}
                  </form>
            </div>
            <div>
                  {/* Форма изменения пароля */}
              <div >
                  <h3 className="text-2xl font-bold text-center text-white pb-6 ">
                    Изменить пароль
                  </h3>
                  <form onSubmit={handleSubmitPassword} className="space-y-4">
                    <input 
                      type="password"
                      placeholder="Текущий пароль"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    {errors.currentPassword && <p className="text-red-500 text-sm mt-1">{errors.currentPassword}</p>}
                    
                    <input 
                      type="password"
                      placeholder="Новый пароль"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    {errors.newPassword && <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>}
                    
                    <input 
                      type="password"
                      placeholder="Подтвердите пароль"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-gray)] rounded bg-dark text-white focus:outline-none focus:border-[var(--color-accent)]"
                    />
                    {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                    
                    <button 
                      type="submit"
                      disabled={isLoading}
                      className={`w-full bg-[var(--color-accent)] text-white py-2 px-4 rounded transition ${
                        isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-90'
                      }`}
                    >
                      {isLoading ? 'Сохранение...' : 'Изменить пароль'}
                    </button>
                    
                    {passwordSuccess && <p className="text-green-500 text-sm text-center">Пароль успешно изменен!</p>}
                  </form>
              </div>
                
                {/* Кнопка выхода */}
                <Link href="/api/auth/logout">
                  <button className="w-full bg-orange-600 text-white py-6 rounded hover:brightness-90 transition mt-4">
                    Выйти из профиля
                  </button>
                </Link>
                
                {/* Кнопка удаления профиля */}
                <button 
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full bg-red-600 text-white py-6 px-4 rounded transition hover:brightness-90 mt-4"
                >
                  Удалить профиль
                </button>
            </div>
          </div>
        </div>
      <Footer />
      
      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-dark p-6 rounded-lg space-y-4">
            <p className="text-white text-center">
              Вы уверены, что хотите удалить профиль? Это действие нельзя отменить.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="w-full bg-[var(--color-gray)] text-white py-2 rounded hover:brightness-90"
              >
                Отмена
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className={`w-full bg-red-600 text-white py-2 rounded transition ${
                  isDeleting ? 'opacity-70 cursor-not-allowed' : 'hover:brightness-90'
                }`}
              >
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfilePage;