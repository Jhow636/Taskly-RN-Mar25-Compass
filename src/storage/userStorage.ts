import {storage} from '../../App'; // Importa a instância MMKV do App.tsx

// Define uma interface para o objeto User para tipagem
export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  picture?: string;
}

// Chave prefixo para evitar colisões com outras chaves no MMKV
const USER_STORAGE_PREFIX = 'user_';

/**
 * Salva um objeto de usuário no MMKV.
 * A chave usada será 'user_' + email do usuário.
 * @param user O objeto User a ser salvo.
 */
export const saveUser = (user: User): boolean => {
  if (!user || !user.email) {
    console.error('Erro ao salvar usuário: dados inválidos fornecidos.');
    return false;
  }
  try {
    const userKey = `${USER_STORAGE_PREFIX}${user.email.toLowerCase()}`; // Usa email como parte da chave
    const userJson = JSON.stringify(user);
    storage.set(userKey, userJson); // Armazena o usuário no MMKV
    console.log(`Usuário ${user.email} salvo com sucesso.`);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar usuário ${user.email}:`, error);
    return false;
  }
};

/**
 * Busca um usuário no MMKV pelo seu endereço de e-mail.
 * @param email O e-mail do usuário a ser buscado.
 * @returns O objeto User se encontrado, ou null caso contrário.
 */
export const getUserByEmail = (email: string): User | null => {
  if (!email) {
    return null; // Retorna null se o e-mail não for fornecido
  }
  try {
    const userKey = `${USER_STORAGE_PREFIX}${email.toLowerCase()}`;
    const userJson = storage.getString(userKey); // Busca o usuário no MMKV

    if (userJson) {
      const user: User = JSON.parse(userJson); // Converte de volta para objeto User
      return user;
    } else {
      return null; // Usuário não encontrado
    }
  } catch (error) {
    console.error(`Erro ao buscar usuário ${email}:`, error);
    return null;
  }
};

const REMEMBERED_EMAIL_KEY = 'rememberedUserEmail'; // Chave para o email lembrado

/**
 * Salva o e-mail do usuário para ser lembrado no próximo login.
 * @param email O e-mail a ser lembrado.
 */
export const saveRememberedEmail = (email: string): void => {
  try {
    storage.set(REMEMBERED_EMAIL_KEY, email); // Armazena o e-mail no MMKV
  } catch (error) {
    console.error('Erro ao salvar e-mail lembrado:', error);
  }
};

/**
 * Salva o e-mail do usuário para ser lembrado no próximo login.
 * @param email O e-mail a ser lembrado.
 */
export const getRememberedEmail = (): string | null => {
  try {
    const email = storage.getString(REMEMBERED_EMAIL_KEY); // Busca o e-mail no MMKV
    return email || null;
  } catch (error) {
    console.error('Erro ao buscar e-mail lembrado:', error);
    return null; // Retorna null se não houver e-mail lembrado
  }
};

/**
 * Remove o e-mail lembrado do MMKV.
 */
export const clearRememberedEmail = (): void => {
  try {
    storage.delete(REMEMBERED_EMAIL_KEY); // Remove o e-mail do MMKV
  } catch (error) {
    console.error('Erro ao limpar e-mail lembrado:', error);
  }
};

/**
 * Remove um usuário do MMKV pelo seu endereço de e-mail.
 * @param email O e-mail do usuário a ser removido.
 */
export const removeUserByEmail = (email: string): boolean => {
  if (!email) {
    return false; // Retorna false se o e-mail não for fornecido
  }
  try {
    const userKey = `${USER_STORAGE_PREFIX}${email.toLowerCase()}`;
    if (storage.contains(userKey)) {
      storage.delete(userKey); // Remove o usuário do MMKV
      console.log(`Usuário ${email} removido com sucesso.`);
      return true;
    } else {
      console.log(`Usuário ${email} não encontrado para remoção.`);
      return false;
    }
  } catch (error) {
    console.error(`Erro ao remover usuário ${email}:`, error);
    return false;
  }
};

// Função para listar todos os usuários armazenados (opcional)
export const getAllUsers = (): User[] => {
  try {
    const allKeys = storage.getAllKeys(); // Obtém todas as chaves armazenadas
    const userKeys = allKeys.filter(key => key.startsWith(USER_STORAGE_PREFIX));
    const users: User[] = [];
    userKeys.forEach(key => {
      const userJson = storage.getString(key);
      if (userJson) {
        try {
          users.push(JSON.parse(userJson)); // Adiciona o usuário à lista
        } catch (parseError) {
          console.error(`Erro ao parsear dados do usuário para a chave ${key}:`, parseError);
        }
      }
    });
    return users; // Retorna a lista de usuários
  } catch (error) {
    console.error('Erro ao buscar todos os usuários:', error);
    return []; // Retorna uma lista vazia em caso de erro
  }
};

// --- Authentication Token Keys ---
const ID_TOKEN_KEY = 'authTokenId';
const REFRESH_TOKEN_KEY = 'authTokenRefresh';

/**
 * Saves the ID token and refresh token to MMKV storage.
 * @param idToken The authentication ID token.
 * @param refreshToken The refresh token.
 */
export const saveAuthTokens = (idToken: string, refreshToken: string): void => {
  try {
    storage.set(ID_TOKEN_KEY, idToken);
    storage.set(REFRESH_TOKEN_KEY, refreshToken);
    console.log('Auth tokens saved successfully.');
  } catch (error) {
    console.error('Error saving auth tokens:', error);
  }
};

/**
 * Retrieves the ID token from MMKV storage.
 * @returns The stored ID token or null if not found or on error.
 */
export const getIdToken = (): string | null => {
  try {
    const token = storage.getString(ID_TOKEN_KEY);
    return token || null;
  } catch (error) {
    console.error('Error retrieving ID token:', error);
    return null;
  }
};

/**
 * Retrieves the refresh token from MMKV storage.
 * @returns The stored refresh token or null if not found or on error.
 */
export const getRefreshToken = (): string | null => {
  try {
    const token = storage.getString(REFRESH_TOKEN_KEY);
    return token || null;
  } catch (error) {
    console.error('Error retrieving refresh token:', error);
    return null;
  }
};

/**
 * Removes both the ID token and refresh token from MMKV storage (logout).
 */
export const clearAuthTokens = (): void => {
  try {
    storage.delete(ID_TOKEN_KEY);
    storage.delete(REFRESH_TOKEN_KEY);
    console.log('Auth tokens cleared successfully.');
  } catch (error) {
    console.error('Error clearing auth tokens:', error);
  }
};
