'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskCard from '../../components/TaskCard';
import Alert from '../../components/Alert';
import { taskAPI } from '@/lib/api';
import { Task, User } from '@/types';

export default function AllTasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [alert, setAlert] = useState<{ type: 'success' | 'warning' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await taskAPI.getAllTasks();
      if (response.success) {
        setTasks(response.data);
      } else {
        setError('Error al cargar las tareas');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (id: string) => {
    router.push(`/tasks/${id}`);
  };

  const getUserDisplayName = (user: User | string | undefined): string => {
    if (!user) return 'Usuario Desconocido';
    if (typeof user === 'object' && user !== null) {
      return user.name;
    }
    if (typeof user === 'string') {
      if (user === 'user-default') return 'Usuario por Defecto';
      return user.replace('user-', 'Usuario ');
    }
    return 'Usuario Desconocido';
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a Inicio
          </button>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Todas las Tareas
          </h1>
          <p className="text-gray-600">
            Visualiza todas las tareas de todos los usuarios 
          </p>
        </div>

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Total de Tareas: {tasks.length}
          </h2>
        </div>

        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError('')}
          />
        )}

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Cargando tareas...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">No hay tareas disponibles</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <div key={task._id} className="relative">
                <TaskCard
                  task={task}
                  onView={handleView}
                />
                <div className="absolute top-1 right-3 z-10 group">
                  <div className="relative">
                    <button
                      className="p-1.5 bg-purple-100 text-purple-800 rounded-full shadow-sm hover:bg-purple-200 transition-colors"
                      aria-label={getUserDisplayName(task.user)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </button>
                    <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible pointer-events-none transition-all duration-200 z-20">
                      {getUserDisplayName(task.user)}
                      <div className="absolute -top-1 right-2 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
