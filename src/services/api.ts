import axios, {AxiosError, InternalAxiosRequestConfig} from 'axios';
import {UserProfile} from '../context/AuthContext';

const API_BASE_URL = 'http://15.229.11.44:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface LoginResponse {
  id_token: string;
  refresh_token: string;
}

interface RefreshTokenResponse {
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

interface ApiErrorData {
  error?: string;
  message?: string;
  invalidEmails?: string[];
}

export class CustomApiError extends Error {
  status?: number;
  data?: ApiErrorData;

  constructor(message: string, status?: number, data?: ApiErrorData) {
    super(message);
    this.name = 'CustomApiError';
    this.status = status;
    this.data = data;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CustomApiError);
    }
  }
}

// Funções de callback a serem fornecidas pelo AuthContext
let _getRefreshToken: () => string | null = () => null;
let _setRefreshTokens: (idToken: string, refreshToken: string) => void = () => {};
let _logoutUser: () => void = () => {};

export const initializeApiClient = (
  getRefreshTokenFunc: () => string | null,
  setRefreshTokensFunc: (idToken: string, refreshToken: string) => void,
  logoutUserFunc: () => void,
) => {
  _getRefreshToken = getRefreshTokenFunc;
  _setRefreshTokens = setRefreshTokensFunc;
  _logoutUser = logoutUserFunc;
  console.log('API Client initialized with AuthContext callbacks.');
};

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Interceptor de Requisição: Adiciona o idToken
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const noAuthRoutes = ['/auth/login', '/auth/register', '/auth/refresh'];
    if (noAuthRoutes.some(route => config.url?.endsWith(route))) {
      return config;
    }
    const token = apiClient.defaults.headers.common.Authorization?.toString().replace(
      'Bearer ',
      '',
    );

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`API Request Interceptor: Added token to ${config.url}`);
    } else {
      console.log(`API Request Interceptor: No token found for ${config.url}`);
    }
    return config;
  },
  error => {
    console.error('API Request Interceptor Error:', error);
    return Promise.reject(error);
  },
);

// Interceptor de Resposta: Lida com renovação de token
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.endsWith('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({resolve, reject});
        })
          .then(() => apiClient(originalRequest))
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      console.log('API Response Interceptor: Token expired (401). Attempting refresh.');

      const localRefreshToken = _getRefreshToken();

      if (!localRefreshToken) {
        console.log('API Response Interceptor: No refresh token available. Logging out.');
        _logoutUser();
        isRefreshing = false;
        processQueue(new Error('No refresh token'), null);
        return Promise.reject(new CustomApiError('Sessão expirada. Faça login novamente.', 401));
      }

      try {
        const response = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {refresh_token: localRefreshToken},
          {
            headers: {'Content-Type': 'application/json'},
          },
        );
        const {idToken, refreshToken: newRefreshToken} = response.data;
        console.log('API Response Interceptor: Token refreshed successfully.');
        _setRefreshTokens(idToken, newRefreshToken);

        apiClient.defaults.headers.common.Authorization = `Bearer ${idToken}`;
        originalRequest.headers.Authorization = `Bearer ${idToken}`;

        processQueue(null, idToken);
        isRefreshing = false;
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        console.error(
          'API Response Interceptor: Failed to refresh token.',
          refreshError.response?.data || refreshError.message,
        );
        _logoutUser();
        isRefreshing = false;
        processQueue(refreshError, null);
        const message =
          refreshError.response?.data?.message ||
          refreshError.response?.data?.error ||
          'Sua sessão expirou. Por favor, faça login novamente.';
        return Promise.reject(new CustomApiError(message, refreshError.response?.status || 401));
      }
    }
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorData>;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const errorData = axiosError.response.data;
        const errorMessage = errorData?.error || errorData?.message || `Erro ${status} na API.`;
        console.error(`API Error ${status}:`, errorMessage, errorData);
        return Promise.reject(new CustomApiError(errorMessage, status, errorData));
      } else if (axiosError.request) {
        console.error('Network Error:', axiosError.message);
        return Promise.reject(new CustomApiError('Falha na conexão. Verifique sua internet.', -1));
      } else {
        console.error('Axios Setup Error:', axiosError.message);
        return Promise.reject(
          new CustomApiError(axiosError.message || 'Erro ao configurar requisição.'),
        );
      }
    }
    return Promise.reject(error);
  },
);

export const registerUser = async (
  email: string,
  password: string,
  fullName: string,
  phone: string,
): Promise<any> => {
  try {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      name: fullName,
      phone_number: phone.replace(/\D/g, ''),
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao registrar usuário (chamada API /auth/register):', error);
  }
};

/**
 * Calls the backend API to log in a user.
 * @param email User's email
 * @param password User's password
 * @returns Promise resolving with LoginResponse containing tokens.
 * @throws {CustomApiError} On API errors or network issues.
 */
export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  try {
    console.log(`Attempting login for ${email} at ${API_BASE_URL}/auth/login`);
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    if (!response.data || !response.data.id_token || !response.data.refresh_token) {
      console.error('API Login Response missing tokens:', response.data);
      throw new CustomApiError('Resposta da API inválida: tokens ausentes.', response.status);
    }

    console.log('Login API call successful.');
    return response.data;
  } catch (error) {
    console.error('Erro na chamada de login API (Axios):', error);

    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiErrorData>;
      if (axiosError.response) {
        const status = axiosError.response.status;
        const errorData = axiosError.response.data;
        const errorMessage = errorData?.error || errorData?.message || `Erro ${status}`;
        console.error(`API Error ${status}:`, errorMessage, errorData);
        throw new CustomApiError(errorMessage, status, errorData);
      } else if (axiosError.request) {
        console.error('Network Error:', axiosError.message);
        throw new CustomApiError('Falha na conexão. Verifique sua internet.', -1);
      } else {
        console.error('Axios Setup Error:', axiosError.message);
        throw new CustomApiError(axiosError.message || 'Erro ao configurar requisição.');
      }
    } else if (error instanceof CustomApiError) {
      throw error;
    } else if (error instanceof Error) {
      console.error('Generic Error during login:', error.message);
      throw new CustomApiError(error.message || 'Ocorreu um erro inesperado.');
    }
    // Fallback for unknown errors
    console.error('Unknown Error during login:', error);
    throw new CustomApiError('Ocorreu um erro desconhecido durante o login.');
  }
};

// Adicionar a função updateFullProfile e exportá-la
export const updateFullProfile = async (profileData: {
  name: string;
  phone: string;
  picture: string;
}): Promise<void> => {
  try {
    await apiClient.post('/profile', {
      name: profileData.name,
      phone: profileData.phone.replace(/\D/g, ''), // API espera apenas números
      picture: profileData.picture,
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil completo (API):', error);
    throw error; // Re-throw para ser tratado pelo chamador
  }
};

// --- Outras funções da API que você pode ter ---

// GET /profile
export const getProfile = async (): Promise<UserProfile> => {
  // Defina uma interface para o perfil
  const response = await apiClient.get('/profile');
  return response.data as UserProfile;
};

// PUT /profile/name
export const updateProfileName = async (name: string): Promise<void> => {
  await apiClient.put('/profile/name', {name});
};

// PUT /profile/avatar
export const updateProfileAvatar = async (picture: string): Promise<void> => {
  await apiClient.put('/profile/avatar', {picture});
};

// GET /tasks
export const getTasks = async (): Promise<any[]> => {
  // Defina uma interface para Task
  const response = await apiClient.get('/tasks');
  return response.data;
};

// POST /tasks
export const createTask = async (taskData: any): Promise<any> => {
  // Defina uma interface para os dados da nova tarefa
  const response = await apiClient.post('/tasks', taskData);
  return response.data;
};

// PUT /tasks/:id
export const updateTask = async (taskId: string, taskData: any): Promise<void> => {
  // Defina uma interface
  await apiClient.put(`/tasks/${taskId}`, taskData);
};

// GET /users/search
export const searchUsers = async (query: string): Promise<any[]> => {
  // Defina uma interface para o usuário da busca
  const response = await apiClient.get('/users/search', {params: {query}});
  return response.data;
};

// DELETE /tasks/:id
export const deleteTaskApi = async (taskId: string): Promise<void> => {
  await apiClient.delete(`/tasks/${taskId}`);
};
