'use client';

import { Task } from '@/types';
import { formatDate } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function TaskCard({ task, onDelete, onView, onEdit }: TaskCardProps) {
  const getProgressStatus = (): 'pendiente' | 'en-progreso' | 'completada' => {
    if (task.progressStatus && task.progressStatus.length > 0) {
      return task.progressStatus[task.progressStatus.length - 1].status;
    }
    if (task.status && ['pendiente', 'en-progreso', 'completada'].includes(task.status)) {
      return task.status as 'pendiente' | 'en-progreso' | 'completada';
    }
    return 'pendiente';
  };

  const currentStatus = getProgressStatus();

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


  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex-1">
          {task.title}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium mr-10 ${statusColors[currentStatus]}`}
        >
          {statusLabels[currentStatus]}
        </span>
      </div>

      <p className="text-gray-600 mb-4 line-clamp-2">{task.description}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {task.tags && task.tags.length > 0 && (
          <>
            {task.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </>
        )}
      </div>

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          {task.responsible && (
            <span className="mr-4">👤 {task.responsible}</span>
          )}
          <span>📅 {formatDate(task.dueDate)}</span>
        </div>
        <div className="flex gap-2">
          {onView && (
            <button
              onClick={() => onView(task._id)}
              className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
              title="Ver detalle"
              aria-label="Ver detalle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(task._id)}
              className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
              title="Editar"
              aria-label="Editar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(task._id)}
              className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
              title="Eliminar"
              aria-label="Eliminar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
