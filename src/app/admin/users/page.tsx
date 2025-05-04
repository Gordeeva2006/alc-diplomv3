// src\app\admin\users\page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
  role: number;
  role_name: string;
  created_at: string;
}

interface Role {
  id: number;
  name: string;
}

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState<Omit<User, 'id' | 'created_at'> | null>(null); // Инициализация как null
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNonUsers, setShowNonUsers] = useState(false); // Флаг для фильтрации

  const roleMapping = {
    director: 1,
    admin: 2,
    seniorManager: 3,
    manager: 4,
    user: 5,
  };

  const currentRoleId = session?.user?.role 
    ? roleMapping[session.user.role as keyof typeof roleMapping] || 0 
    : 0;

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/users?data=users', {
        headers: {
          'x-user-id': session?.user?.id?.toString() || ''
        }
      });
      if (!res.ok) throw new Error('Ошибка загрузки данных');
      const data = await res.json();
      setUsers(data);
      setIsLoading(false);
    } catch (err) {
      setError('Не удалось загрузить пользователей');
      console.error(err);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await fetch('/api/admin/users?data=roles', {
        headers: {
          'x-user-id': session?.user?.id?.toString() || ''
        }
      });
      if (!res.ok) throw new Error('Ошибка загрузки ролей');
      const data = await res.json();
      setRoles(data);
    } catch (err) {
      console.error('Ошибка загрузки ролей:', err);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (session) {
      fetchData();
      fetchRoles();
    }
  }, [session, status, router]);

  // Фильтрация пользователей (показывать только не-пользователей, если чекбокс включен)
  const filteredUsers = showNonUsers 
    ? users.filter(user => user.role !== 5) // Роль "user" = 5
    : users;

  // Определение доступных ролей для создания
  const getAvailableRoles = () => {
    if (!currentRoleId) return [];
    const directorRoleId = 1;
    const adminRoleId = 2;
    const seniorManagerRoleId = 3;
    switch (currentRoleId) {
      case directorRoleId:
        return roles.filter(r => r.id !== directorRoleId);
      case adminRoleId:
        return roles.filter(r => r.id !== directorRoleId && r.id !== adminRoleId);
      case seniorManagerRoleId:
        return roles.filter(r => r.id === 4); // Только менеджер
      default:
        return [];
    }
  };

  // Проверка прав на редактирование/удаление
  const canEditUser = (user: User) => {
    if (!session?.user?.role) return false;
    const currentUserIsDirector = currentRoleId === 1;
    const currentUserIsAdmin = currentRoleId === 2;
    const currentUserIsSeniorManager = currentRoleId === 3;
    const isEditingSelf = user.id === parseInt(session.user.id || '0');
    
    if (currentUserIsDirector) {
      return !isEditingSelf;
    }
    if (currentUserIsAdmin) {
      return !isEditingSelf && user.role !== 1; // Не может редактировать директоров
    }
    if (currentUserIsSeniorManager) {
      return !isEditingSelf && user.role === 4; // Может редактировать только менеджеров
    }
    return false;
  };

  const canDeleteUser = (user: User) => {
    if (!session?.user?.role) return false;
    const currentUserIsDirector = currentRoleId === 1;
    const currentUserIsAdmin = currentRoleId === 2;
    const currentUserIsSeniorManager = currentRoleId === 3;
    const isEditingSelf = user.id === parseInt(session.user.id || '0');
    
    if (currentUserIsDirector) {
      return !isEditingSelf;
    }
    if (currentUserIsAdmin) {
      return !isEditingSelf && user.role !== 1; // Не может удалять директоров
    }
    if (currentUserIsSeniorManager) {
      return !isEditingSelf && user.role === 4; // Может удалять только менеджеров
    }
    return false;
  };

  // Создание пользователя
  const handleCreateUser = async () => {
    if (!newUser) return;
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': session?.user?.id?.toString() || ''
        },
        body: JSON.stringify(newUser)
      });
      if (!res.ok) throw new Error('Ошибка создания пользователя');
      fetchData();
      setNewUser(null); // Закрытие модального окна
    } catch (error) {
      console.error('Ошибка создания пользователя:', error);
    }
  };

  // Редактирование пользователя
  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      const res = await fetch(`/api/admin/users?id=${editingUser.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': session?.user?.id?.toString() || ''
        },
        body: JSON.stringify(editingUser)
      });
      if (!res.ok) throw new Error('Ошибка обновления пользователя');
      fetchData();
      setEditingUser(null);
    } catch (error) {
      console.error('Ошибка обновления пользователя:', error);
    }
  };

  // Удаление пользователя
  const handleDeleteUser = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить пользователя?')) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': session?.user?.id?.toString() || ''
        }
      });
      if (!res.ok) throw new Error('Ошибка удаления пользователя');
      fetchData();
    } catch (error) {
      console.error('Ошибка удаления пользователя:', error);
    }
  };

  if (status === 'loading') {
    return <div>Загрузка...</div>;
  }

  if (status === 'unauthenticated') {
    return null; // Redirect handled by router
  }

  return (
    <div className="p-6 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление пользователями</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => setNewUser({ email: '', role: 4, role_name: 'manager' })}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Добавить пользователя
          </button>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showNonUsers}
              onChange={(e) => setShowNonUsers(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600"
            />
            <span>Показать только не-пользователей</span>
          </label>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Роль</th>
              <th className="px-4 py-2">Дата регистрации</th>
              <th className="px-4 py-2">Действия</th>
            </tr>
          </thead>
          <tbody className="text-black">
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-t">
                <td className="px-4 py-2">{user.id}</td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.role_name}</td>
                <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  {canEditUser(user) && (
                    <button 
                      onClick={() => setEditingUser(user)}
                      className="text-blue-500 hover:underline"
                    >
                      Редактировать
                    </button>
                  )}
                  {canDeleteUser(user) && (
                    <button 
                      onClick={() => handleDeleteUser(user.id)}
                      className="text-red-500 hover:underline"
                    >
                      Удалить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Модальное окно создания пользователя */}
      {newUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Создать пользователя</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    email: e.target.value
                  })}
                  className="w-full border p-2 rounded"
                  required
                />
              </div>
              <div>
                <label className="block mb-1">Роль</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({
                    ...newUser,
                    role: parseInt(e.target.value),
                    role_name: roles.find(r => r.id === parseInt(e.target.value))?.name || 'manager'
                  })}
                  className="w-full border p-2 rounded"
                  disabled={!getAvailableRoles().length}
                >
                  {getAvailableRoles().map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setNewUser(null)}
                className="px-4 py-2 border rounded"
              >
                Отмена
              </button>
              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Модальное окно редактирования */}
      {editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Редактировать пользователя</h2>
            <div className="space-y-4">
              <div>
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    email: e.target.value
                  })}
                  className="w-full border p-2 rounded"
                  disabled
                />
              </div>
              <div>
                <label className="block mb-1">Роль</label>
                <select
                  value={editingUser.role}
                  onChange={(e) => setEditingUser({
                    ...editingUser,
                    role: parseInt(e.target.value),
                    role_name: roles.find(r => r.id === parseInt(e.target.value))?.name || 'manager'
                  })}
                  className="w-full border p-2 rounded"
                >
                  {getAvailableRoles().map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 border rounded"
              >
                Отмена
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}