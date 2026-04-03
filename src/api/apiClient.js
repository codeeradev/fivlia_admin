import axios from 'axios';
import { API_BASE_URL } from 'api/endPoints.js';
import { showAlert } from "components/commonFunction/alertsLoader";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 50000,
});

// Get token from localStorage
const getToken = () => {
  const token = localStorage.getItem("token");
  //console.log('API Client: getToken called, token found:', !!token);
  return token;
};

// Helper function to add auth headers
const withAuth = (config = {}) => {
  const token = getToken();
  //console.log('API Client: withAuth called, token found:', !!token);

  if (!token) {
    //console.warn('API Client: withAuth called but no token found');
    return config;
  }

  const authConfig = {
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${token}`
    }
  };

  //console.log('API Client: withAuth final config headers:', authConfig.headers);
  return authConfig;
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    //console.log('API Client: Request interceptor called for:', config.url);
    //console.log('API Client: Config authRequired flag:', config.authRequired);

    if (config.authRequired) {
      const token = getToken();
      console.log('token',token)
      //console.log('API Client: authRequired: true detected, token:', token ? 'present' : 'missing');

      if (token) {
        config.headers = config.headers || {};
        config.headers['Authorization'] = `Bearer ${token}`;
        //console.log('API Client: Authorization header set:', config.headers['Authorization']);
      } else {
        
        //console.warn('API Client: authRequired: true but no token found in localStorage');
      }

      // Clean up to avoid passing custom flags to server
      delete config.authRequired;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // console.log('API Client: Response received for:', response.config.url);
    // console.log('API Client: Response status:', response.status);
    // console.log('API Client: Request headers that were sent:', response.config.headers);
    // console.log('API Client: Authorization header sent:', response.config.headers.Authorization);
    return response;
  },
  (error) => {
    const message = error.response?.data?.message;

        if (message === "Permission denied") {
      showAlert("error", "You do not have permission to perform this action.");
      return Promise.reject(error);
    }

    // ⭐ Token-related auth failure
    if (message === "Token missing" || message === "Invalid Token") {
      localStorage.removeItem("token");
      showAlert("error", "Session expired. Please login again.");
      return Promise.reject(error);
    }


    if (error.response?.status === 401) {
      // console.warn('API Client: 401 Unauthorized - token might be invalid');
      // console.log('API Client: Error response data:', error.response?.data);

      const message = error.response?.data?.message?.toLowerCase() || '';

      if (
        message.includes('unauthorized') ||
        message.includes('invalid token') ||
        message.includes('token expired')
      ) {
        // console.log('API Client: Removing token due to authentication failure');
        localStorage.removeItem("token");
        // console.log('API Client: Token removed, current token:', !!localStorage.getItem("token"));
      } else {
        // console.log('API Client: 401 error but not removing token - might be server issue');
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions
export const get = (endpoint, config = {}) => {
  const finalConfig = config.authRequired ? withAuth(config) : config;
  return apiClient.get(endpoint, finalConfig);
};

export const post = (endpoint, data, config = {}) => {
  const finalConfig = config.authRequired ? withAuth(config) : config;

  return apiClient.post(endpoint, data, finalConfig);
};

export const put = (endpoint, data, config = {}) => {
  const finalConfig = config.authRequired ? withAuth(config) : config;
  return apiClient.put(endpoint, data, finalConfig);
};

export const del = (endpoint, config = {}) => {
  const finalConfig = config.authRequired ? withAuth(config) : config;
  return apiClient.delete(endpoint, finalConfig);
};

export const patch = (endpoint, data, config = {}) => {
  const finalConfig = config.authRequired ? withAuth(config) : config;
  return apiClient.patch(endpoint, data, finalConfig);
};

export default apiClient;