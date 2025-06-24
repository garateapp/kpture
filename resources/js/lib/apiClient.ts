// resources/js/lib/apiClient.ts

import axios from 'axios';

// Creamos una instancia de axios completamente nueva
const apiClient = axios.create();

// Configuramos el interceptor para esta instancia específica
apiClient.interceptors.request.use(config => {
    // Asegúrate de que X-Inertia no esté en la petición para esta instancia API
    if (config.headers && config.headers['X-Inertia']) {
        delete config.headers['X-Inertia'];
    }

    // Asegúrate de que X-Requested-With esté presente para Laravel APIs
    if (config.headers && !config.headers['X-Requested-With']) {
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
    }

    // Asegúrate de que X-CSRF-TOKEN esté presente para POST/PUT/DELETE
    const csrfToken = document.querySelector('meta[name="csrf-token"]')
                                ?.getAttribute('content');
    if (csrfToken && config.headers && !config.headers['X-CSRF-TOKEN']) {
        config.headers['X-CSRF-TOKEN'] = csrfToken;
    }

    return config;
}, error => {
    return Promise.reject(error);
});

export default apiClient; // Exporta esta instancia configurada
