import {MMKV} from 'react-native-mmkv';

// Inicializa o armazenamento MMKV
export const storage = new MMKV({
  id: 'task-app-storage',
  encryptionKey: 'task-app-secret-key',
});

// Chaves para armazenamento
export const STORAGE_KEYS = {
  USER_DATA: 'user_data',
  AUTH_TOKEN: 'auth_token',
};

// Tipo para os dados do usuário
export interface UserData {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  avatarId: number | null;
}

// Salvar dados do usuário
export const saveUserData = (userData: UserData): void => {
  storage.set(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
};

// Obter dados do usuário
export const getUserData = (): UserData | null => {
  const data = storage.getString(STORAGE_KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
};

// Salvar token de autenticação
export const saveAuthToken = (token: string): void => {
  storage.set(STORAGE_KEYS.AUTH_TOKEN, token);
};

// Obter token de autenticação
export const getAuthToken = (): string | null => {
  const token = storage.getString(STORAGE_KEYS.AUTH_TOKEN);
  return token || null;
};

// Limpar dados do usuário
export const clearUserData = (): void => {
  storage.delete(STORAGE_KEYS.USER_DATA);
  storage.delete(STORAGE_KEYS.AUTH_TOKEN);
};
