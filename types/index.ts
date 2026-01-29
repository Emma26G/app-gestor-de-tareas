export interface ProgressStatus {
  status: 'pendiente' | 'en-progreso' | 'completada';
  date: string;
}

export interface User {
  _id: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  progressStatus?: ProgressStatus[];
  status?: 'pendiente' | 'en-progreso' | 'completada' | 'active' | 'inactive' | 'deleted';
  dueDate: string;
  tags?: string[];
  responsible?: string;
  comments?: string;
  user?: User | string;
  createdAt: string;
}
