import mongoose from 'mongoose';

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id);
}

export function toObjectId(id: string): mongoose.Types.ObjectId {
  return new mongoose.Types.ObjectId(id);
}

export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function formatDate(
  dateString: string,
  options?: {
    month?: 'short' | 'long' | 'numeric';
    includeTime?: boolean;
  }
): string {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: options?.month || 'short',
    day: 'numeric',
  };

  if (options?.includeTime !== false) {
    defaultOptions.hour = '2-digit';
    defaultOptions.minute = '2-digit';
  }

  return date.toLocaleDateString('es-ES', defaultOptions);
}

export function parseTags(tags: string): string[] {
  if (!tags) return [];
  return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
}
