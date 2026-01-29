'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import TaskForm from '../../components/TaskForm';
import Alert from '../../components/Alert';
import ConfirmDialog from '../../components/ConfirmDialog';
import { taskAPI } from '@/lib/api';
import { formatDateForInput, formatDate, parseTags } from '@/lib/utils';
import { Task } from '@/types';

interface TaskWithDates extends Task {
  isOwner?: boolean;
  updatedAt: string;
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskWithDates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'warning' | 'error' | 'info'; message: string } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await taskAPI.getById(taskId);
      if (response.success) {
        setTask(response.data);
      } else {
        setError('Error al cargar la tarea');
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar la tarea');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : task?.dueDate,
        comments: formData.comments || '',
        responsible: formData.responsible || '',
        tags: parseTags(formData.tags || ''),
      };

      const response = await taskAPI.update(taskId, taskData);
      if (response.success) {
        setAlert({ type: 'success', message: 'Tarea actualizada correctamente' });
      setIsEditing(false);
      loadTask();
      } else {
        setAlert({ type: 'error', message: response.error || 'Error al actualizar la tarea' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: 'Error al actualizar la tarea: ' + err.message });
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await taskAPI.delete(taskId);
      if (response.success) {
        setAlert({ type: 'success', message: 'Tarea eliminada correctamente ' });
        setTimeout(() => {
          router.push('/');
        }, 1500);
      } else {
        setAlert({ type: 'error', message: response.error || 'Error al eliminar la tarea' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: 'Error al eliminar la tarea: ' + err.message });
    } finally {
      setShowDeleteConfirm(false);
    }
  };


  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600">Cargando tarea...</p>
        </div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={() => router.push('/')}
              className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver a la lista
            </button>
            <Alert
              type="error"
              message={error || 'Tarea no encontrada'}
            />
          </div>
        </div>
      </div>
    );
  }

  const currentStatus = task.progressStatus && task.progressStatus.length > 0
    ? task.progressStatus[task.progressStatus.length - 1].status
    : (task.status || 'pendiente');

  const statusColors = {
    pendiente: 'bg-yellow-100 text-yellow-800',
    'en-progreso': 'bg-blue-100 text-blue-800',
    completada: 'bg-green-100 text-green-800',
  };

  const statusLabels = {
    pendiente: 'Pendiente',
    'en-progreso': 'En Progreso',
    completada: 'Completada',
  };

  const initialFormData = {
    title: task.title,
    description: task.description,
    status: currentStatus,
    dueDate: formatDateForInput(task.dueDate),
    comments: task.comments || '',
    responsible: task.responsible || '',
    tags: task.tags ? task.tags.join(', ') : '',
    progressStatus: task.progressStatus,
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver a la lista
          </button>

          {alert && (
            <Alert
              type={alert.type}
              message={alert.message}
              onClose={() => setAlert(null)}
            />
          )}

          <ConfirmDialog
            isOpen={showDeleteConfirm}
            message="¿Estás seguro de que quieres eliminar esta tarea?"
            onConfirm={confirmDelete}
            onCancel={() => setShowDeleteConfirm(false)}
            confirmText="Eliminar"
            cancelText="Cancelar"
          />

          {isEditing ? (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-6">Editar Tarea</h1>
              <TaskForm
                initialData={initialFormData}
                onSubmit={handleSubmit}
                onCancel={() => setIsEditing(false)}
                submitLabel="Guardar Cambios"
              />
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-3xl font-bold text-gray-800">{task.title}</h1>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[currentStatus]}`}
                >
                  {statusLabels[currentStatus]}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                  <p className="text-gray-800 whitespace-pre-wrap">{task.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de Entrega</h3>
                    <p className="text-gray-800">{formatDate(task.dueDate, { month: 'long' })}</p>
                  </div>
                  {task.responsible && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Responsable</h3>
                      <p className="text-gray-800">{task.responsible}</p>
                    </div>
                  )}
                </div>

                {task.tags && task.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {task.comments && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Comentarios</h3>
                    <p className="text-gray-800 whitespace-pre-wrap">{task.comments}</p>
                  </div>
                )}

                {task.progressStatus && task.progressStatus.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Historial de Estados</h3>
                    <div className="space-y-2">
                      {task.progressStatus.map((statusItem, index) => (
                        <div key={index} className="flex items-center gap-3 text-sm">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[statusItem.status]}`}>
                            {statusLabels[statusItem.status]}
                          </span>
                          <span className="text-gray-600">
                            {formatDate(statusItem.date)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {task.user && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Propietario</h3>
                    <p className="text-gray-800">
                      {typeof task.user === 'object' && task.user !== null 
                        ? task.user.name 
                        : 'Usuario'}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Creada: {formatDate(task.createdAt)}
                  </p>
                  {task.updatedAt !== task.createdAt && (
                    <p className="text-xs text-gray-500">
                      Actualizada: {formatDate(task.updatedAt)}
                    </p>
                  )}
                </div>
              </div>

              {task.isOwner && (
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Editar Tarea
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
                >
                  Eliminar
                </button>
              </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
