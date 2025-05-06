import axios, {AxiosError} from 'axios';

const API_BASE_URL = 'http://15.229.11.44:3000';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface LoginResponse {
  id_token: string;
  refresh_token: string;
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

export const registerUser = async (
  email: string,
  password: string,
  fullName: string,
  phone: string,
  avatarId: string,
) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      email,
      password,
      name: fullName,
      phone_number: phone.replace(/\D/g, ''),
      picture: avatarId,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Erro ao registrar');
  }
  return data;
};

/**
 * Calls the backend API to log in a user.
 * @param email User's email
 * @param password User's password
 * @returns Promise resolving with LoginResponse containing tokens.
 * @throws {CustomApiError} On API errors or network issues.
 */
export const loginUser = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    console.log(`Attempting login for ${email} at ${API_BASE_URL}/auth/login`);
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    if (
      !response.data ||
      !response.data.id_token ||
      !response.data.refresh_token
    ) {
      console.error('API Login Response missing tokens:', response.data);
      throw new CustomApiError(
        'Resposta da API inválida: tokens ausentes.',
        response.status,
      );
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
        const errorMessage =
          errorData?.error || errorData?.message || `Erro ${status}`;
        console.error(`API Error ${status}:`, errorMessage, errorData);
        throw new CustomApiError(errorMessage, status, errorData);
      } else if (axiosError.request) {
        console.error('Network Error:', axiosError.message);
        throw new CustomApiError(
          'Falha na conexão. Verifique sua internet.',
          -1,
        );
      } else {
        console.error('Axios Setup Error:', axiosError.message);
        throw new CustomApiError(
          axiosError.message || 'Erro ao configurar requisição.',
        );
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
