'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TaskCard from './components/TaskCard';
import TaskForm from './components/TaskForm';
import Alert from './components/Alert';
import UserSelector from './components/UserSelector';
import ConfirmDialog from './components/ConfirmDialog';
import { taskAPI } from '@/lib/api';
import { formatDateForInput, parseTags } from '@/lib/utils';
import { Task } from '@/types';

export default function Home() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'warning' | 'error' | 'info'; message: string } | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; taskId: string | null }>({ isOpen: false, taskId: null });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUserId = localStorage.getItem('userId');
      setUserId(savedUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
    loadTasks();
    }
  }, [userId]);

  const loadTasks = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError('');
      const response = await taskAPI.getAll();
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

  const handleUserChange = (newUserId: string) => {
    setUserId(newUserId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userId', newUserId);
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({ isOpen: true, taskId: id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.taskId) return;

    try {
      const response = await taskAPI.delete(deleteConfirm.taskId);
      if (response.success) {
        setAlert({ type: 'success', message: 'Tarea eliminada correctamente ' });
        loadTasks();
      } else {
        setAlert({ type: 'error', message: response.error || 'Error al eliminar la tarea' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: 'Error al eliminar la tarea: ' + err.message });
    } finally {
      setDeleteConfirm({ isOpen: false, taskId: null });
    }
  };

  const handleView = (id: string) => {
    router.push(`/tasks/${id}`);
  };

  const handleEdit = async (id: string) => {
    try {
      const response = await taskAPI.getById(id);
      if (response.success) {
        setEditingTask(response.data);
        setIsModalOpen(true);
      } else {
        setAlert({ type: 'error', message: 'Error al cargar la tarea para editar' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: 'Error al cargar la tarea: ' + err.message });
    }
  };

  const handleEditSubmit = async (formData: any) => {
    if (!editingTask) return;

    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : editingTask.dueDate,
        comments: formData.comments || '',
        responsible: formData.responsible || '',
        tags: parseTags(formData.tags || ''),
      };

      const response = await taskAPI.update(editingTask._id, taskData);
      if (response.success) {
        setAlert({ type: 'success', message: 'Tarea actualizada correctamente' });
        setIsModalOpen(false);
        setEditingTask(null);
      loadTasks();
      } else {
        setAlert({ type: 'error', message: response.error || 'Error al actualizar la tarea' });
      }
    } catch (err: any) {
      setAlert({ type: 'error', message: 'Error al actualizar la tarea: ' + err.message });
    }
  };


  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Mis Tareas
          </h1>
          <p className="text-gray-600">
            Administra tus tareas de manera eficiente
          </p>
        </div>

        <UserSelector currentUserId={userId} onUserChange={handleUserChange} />

        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">
            Mis Tareas ({tasks.length})
          </h2>
          <button
            onClick={() => router.push('/tasks/new')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            + Nueva Tarea
          </button>
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
            <p className="text-gray-600 mb-4">No tienes tareas aún</p>
            <button
              onClick={() => router.push('/tasks/new')}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Crear Primera Tarea
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onDelete={handleDelete}
                onView={handleView}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        message="¿Estás seguro de que quieres eliminar esta tarea?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, taskId: null })}
        confirmText="Eliminar"
        cancelText="Cancelar"
      />

      {/* Modal de edición */}
      {isModalOpen && editingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Editar Tarea</h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  aria-label="Cerrar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <TaskForm
                initialData={{
                  title: editingTask.title,
                  description: editingTask.description,
                  status: editingTask.progressStatus && editingTask.progressStatus.length > 0
                    ? editingTask.progressStatus[editingTask.progressStatus.length - 1].status
                    : (editingTask.status || 'pendiente'),
                  dueDate: formatDateForInput(editingTask.dueDate),
                  comments: editingTask.comments || '',
                  responsible: editingTask.responsible || '',
                  tags: editingTask.tags ? editingTask.tags.join(', ') : '',
                  progressStatus: editingTask.progressStatus,
                }}
                onSubmit={handleEditSubmit}
                onCancel={() => {
                  setIsModalOpen(false);
                  setEditingTask(null);
                }}
                submitLabel="Actualizar Tarea"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
