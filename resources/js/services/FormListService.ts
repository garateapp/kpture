// resources/js/services/FormListService.ts

import apiClient from '../lib/apiClient';

//const apiAxios = axios.create({}); // Pasamos un objeto vacío para evitar heredar defaults por defecto

// // *** AÑADIR ESTE INTERCEPTOR ***
// apiAxios.interceptors.request.use(config => {
//     // Asegurarse de que X-Inertia no esté en la petición
//     if (config.headers['X-Inertia']) {
//         delete config.headers['X-Inertia'];
//     }

//     // Asegurarse de que X-Requested-With esté presente para Laravel APIs
//     if (!config.headers['X-Requested-With']) {
//         config.headers['X-Requested-With'] = 'XMLHttpRequest';
//     }

//     // Asegurarse de que X-CSRF-TOKEN esté presente para POST/PUT/DELETE
//     // (si no lo gestiona automáticamente el axios global o un middleware)
//     const csrfToken = document.querySelector('meta[name="csrf-token"]')
//                                 ?.getAttribute('content');
//     if (csrfToken && !config.headers['X-CSRF-TOKEN']) {
//         config.headers['X-CSRF-TOKEN'] = csrfToken;
//     }

//     return config;
// }, error => {
//     return Promise.reject(error);
// });

// Define la interfaz para el modelo FormList
export interface FormList {
  id?: number; // El ID es opcional para la creación
  entidad: string;
  codigo: string;
  valor: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string; // Para SoftDeletes
}

interface FormListErrors {
  entidad?: string[];
  codigo?: string[];
  valor?: string[];
}

interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: { [key: string]: string[] }; // Objeto para manejar errores de validación
  status?: number;
}

const API_URL = '/form-lists'; // La ruta base que definimos en routes/api.php

const FormListService = {
  getAll: async (): Promise<ApiResponse<FormList[]>> => {
    try {
      // Usa apiClient en lugar de apiAxios
      const response = await apiClient.get<FormList[]>(API_URL);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      // ...
    }
  },

  create: async (data: Omit<FormList, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<ApiResponse<FormList>> => {
    try {
      // Usa apiClient
      const response = await apiClient.post<FormList>(API_URL, data);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      // ...
    }
  },

  update: async (id: number, data: Omit<FormList, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): Promise<ApiResponse<FormList>> => {
    try {
      // Usa apiClient
      const response = await apiClient.put<FormList>(`${API_URL}/${id}`, data);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      // ...
    }
  },

  remove: async (id: number): Promise<ApiResponse<void>> => {
    try {
      // Usa apiClient
      const response = await apiClient.delete(`${API_URL}/${id}`);
      return { status: response.status };
    } catch (error: any) {
      // ...
    }
  },
};

export default FormListService;
