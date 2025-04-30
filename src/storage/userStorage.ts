import { storage  } from '../../App'; // Importa a instância MMKV do App.tsx

// Define uma interface para o objeto User para tipagem
export interface User {
    id: string;
    email: string;
    password: string; // Senha deve ser armazenada de forma segura (hash)
    name?: string;
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
