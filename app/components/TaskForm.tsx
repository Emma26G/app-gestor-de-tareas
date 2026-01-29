'use client';

import { useState, FormEvent } from 'react';
import { ProgressStatus } from '@/types';

interface TaskFormData {
  title: string;
  description: string;
  status: 'pendiente' | 'en-progreso' | 'completada';
  dueDate: string;
  comments: string;
  responsible: string;
  tags: string;
}

interface TaskFormProps {
  initialData?: Partial<TaskFormData> & { progressStatus?: ProgressStatus[] };
  onSubmit: (data: TaskFormData) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export default function TaskForm({
  initialData,
  onSubmit,
  onCancel,
  submitLabel = 'Crear Tarea',
}: TaskFormProps) {
  const getCurrentStatus = () => {
    if (initialData?.progressStatus && initialData.progressStatus.length > 0) {
      return initialData.progressStatus[initialData.progressStatus.length - 1].status;
    }
    return initialData?.status || 'pendiente';
  };

  const [formData, setFormData] = useState<TaskFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    status: getCurrentStatus(),
    dueDate: initialData?.dueDate || '',
    comments: initialData?.comments || '',
    responsible: initialData?.responsible || '',
    tags: initialData?.tags || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const getMinDateTime = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (!formData.title.trim()) {
        setError('El título es obligatorio');
        setIsSubmitting(false);
        return;
      }
      if (!formData.description.trim()) {
        setError('La descripción es obligatoria');
        setIsSubmitting(false);
        return;
      }
      if (!formData.dueDate) {
        setError('La fecha de entrega es obligatoria');
        setIsSubmitting(false);
        return;
      }
      
      // Validamos que la fecha no sea anterior a la fecha actual
      const selectedDate = new Date(formData.dueDate);
      const currentDate = new Date();
      if (selectedDate < currentDate) {
        setError('La fecha de entrega no puede ser anterior a la fecha actual');
        setIsSubmitting(false);
        return;
      }

      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Error al guardar la tarea');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Descripción <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Estatus <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            required
          >
            <option value="pendiente">Pendiente</option>
            <option value="en-progreso">En Progreso</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha de Entrega <span className="text-red-500">*</span>
          </label>
          <input
            type="datetime-local"
            id="dueDate"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            min={getMinDateTime()}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="responsible" className="block text-sm font-medium text-gray-700 mb-1">
          Responsable
        </label>
        <input
          type="text"
          id="responsible"
          value={formData.responsible}
          onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
          Tags 
        </label>
        <input
          type="text"
          id="tags"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="urgente, importante, proyecto"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>

      <div>
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-1">
          Comentarios
        </label>
        <textarea
          id="comments"
          value={formData.comments}
          onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
        />
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 text-black py-2 border border-blue-300 rounded-md hover:bg-blue-50 transition"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
