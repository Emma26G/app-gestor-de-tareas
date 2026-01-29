'use client';

import { useState, useEffect } from 'react';
import { userAPI } from '@/lib/api';
import Alert from './Alert';
import { User } from '@/types';

interface UserSelectorProps {
  currentUserId: string | null;
  onUserChange: (userId: string) => void;
}

export default function UserSelector({ currentUserId, onUserChange }: UserSelectorProps) {
  const [userId, setUserId] = useState<string | null>(currentUserId);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      setUserId(currentUserId);
    }
  }, [currentUserId]);

  const selectFirstUser = (usersList: User[]) => {
    if (usersList.length === 0) return;
    
    // Verificar si hay un userId guardado en localStorage
    const savedUserId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    
    // Si ya hay un userId (en props o localStorage), no seleccionar el primero
    if (currentUserId || savedUserId) {
      // Si hay un userId en localStorage pero no en currentUserId, actualizarlo
      if (savedUserId && !currentUserId) {
        setUserId(savedUserId);
        onUserChange(savedUserId);
      }
      return;
    }
    
    // Solo seleccionar el primer usuario si no hay ningún userId guardado
    const firstUserId = usersList[0]._id;
    setUserId(firstUserId);
    onUserChange(firstUserId);
  };

  const handleUsersLoaded = (usersList: User[]) => {
    setUsers(usersList);
    selectFirstUser(usersList);
  };

  const initializeUsers = async () => {
    try {
      const initResponse = await userAPI.init();
      if (!initResponse.success) return false;

      const reloadResponse = await userAPI.getAll();
      if (!reloadResponse.success) return false;

      handleUsersLoaded(reloadResponse.data);
      return true;
    } catch {
      return false;
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await userAPI.getAll();
      
      if (response.success) {
        handleUsersLoaded(response.data);
        return;
      }

      setError('Error al cargar usuarios');
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
      await initializeUsers();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUserId = e.target.value;
    setUserId(newUserId);
    onUserChange(newUserId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      {error && (
        <Alert
          type="error"
          message={error}
          onClose={() => setError(null)}
        />
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <label htmlFor="user-select" className="block text-sm font-semibold text-gray-700 mb-2">
            <span className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Usuario Actual</span>
            </span>
          </label>
          <p className="text-xs text-gray-500 mb-2 sm:mb-0">
            Selecciona un usuario para ver sus tareas
          </p>
        </div>
        <div className="flex-shrink-0">
          {loading ? (
            <div className="px-4 py-2 text-gray-500">Cargando usuarios...</div>
          ) : (
          <select
            id="user-select"
              value={userId || ''}
            onChange={handleChange}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-black font-medium transition-colors"
          >
              {users.length === 0 ? (
                <option value="">No hay usuarios disponibles</option>
              ) : (
                users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))
              )}
          </select>
          )}
        </div>
      </div>
    </div>
  );
}
