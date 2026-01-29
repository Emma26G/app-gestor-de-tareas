const API_BASE_URL = '/api/tasks';
const USER_API_BASE_URL = '/api/users';

function getUserId(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('userId');
  }
  return null;
}

async function fetchWithUserId(url: string, options: RequestInit = {}) {
  const userId = getUserId();
  const headers = new Headers(options.headers);
  
  if (userId) {
    headers.set('x-user-id', userId);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error en la petición');
  }

  return response.json();
}

export const taskAPI = {
  getAll: async () => {
    return fetchWithUserId(API_BASE_URL);
  },

  getAllTasks: async () => {
    const response = await fetch(`${API_BASE_URL}/all`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la petición');
    }
    return response.json();
  },

  getById: async (id: string) => {
    return fetchWithUserId(`${API_BASE_URL}/${id}`);
  },

  create: async (taskData: any) => {
    return fetchWithUserId(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
  },

  update: async (id: string, taskData: any) => {
    return fetchWithUserId(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    });
  },

  delete: async (id: string) => {
    return fetchWithUserId(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });
  },
};

export const userAPI = {
  getAll: async () => {
    const response = await fetch(USER_API_BASE_URL);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la petición');
    }
    return response.json();
  },

  init: async () => {
    const response = await fetch(`${USER_API_BASE_URL}/init`, {
      method: 'POST',
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error en la petición');
    }
    return response.json();
  },
};
