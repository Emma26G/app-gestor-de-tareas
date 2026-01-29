'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import TaskForm from '../../components/TaskForm';
import Alert from '../../components/Alert';
import { taskAPI } from '@/lib/api';
import { parseTags } from '@/lib/utils';

export default function NewTaskPage() {
  const router = useRouter();
  const [alert, setAlert] = useState<{ type: 'success' | 'warning' | 'error' | 'info'; message: string } | null>(null);

  const handleSubmit = async (formData: any) => {
    try {
      const taskData = {
        ...formData,
        tags: parseTags(formData.tags || ''),
      };

      const response = await taskAPI.create(taskData);
      if (response.success) {
        setAlert({ type: 'success', message: 'Tarea creada correctamente' });
        setTimeout(() => {
    router.push('/');
        }, 1500);
      } else {
        setAlert({ type: 'error', message: response.error || 'Error al crear la tarea' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: 'Error al crear la tarea: ' + err.message });
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a la lista
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Crear Nueva Tarea</h1>
          </div>

          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          <div className="bg-white rounded-lg shadow-md p-6">
            <TaskForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              submitLabel="Crear Tarea"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
