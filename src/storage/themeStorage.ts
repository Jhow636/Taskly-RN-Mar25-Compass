import {storage} from '../../App'; // Importa a instância do MMKV que criamos em App.tsx

const THEME_PREFERENCE_KEY = 'userThemePreference'; // Chave para guardar no MMKV

/**
 * Salva a preferência de tema do usuário no MMKV.
 * @param theme 'light' para tema claro, 'dark' para tema escuro.
 */
export const saveThemePreference = (theme: 'light' | 'dark'): void => {
  try {
    storage.set(THEME_PREFERENCE_KEY, theme);
    console.log(`Preferência de tema "${theme}" salva com sucesso!`);
  } catch (error) {
    console.error('Erro ao salvar preferência de tema:', error);
  }
};

/**
 * Lê a preferência de tema salva no MMKV.
 * Retorna 'light' por padrão se nenhuma preferência for encontrada.
 * @returns 'light' ou 'dark'.
 */
export const getThemePreference = (): 'light' | 'dark' => {
  try {
    const theme = storage.getString(THEME_PREFERENCE_KEY);
    if (theme === 'dark') {
      return 'dark';
    }
    return 'light';
  } catch (error) {
    console.error('Erro ao ler preferência de tema:', error);
    return 'light';
  }
};

// Remove a preferência de tema salva no MMKV (útil ao sair da conta ou resetar).
export const removeThemePreference = (): void => {
  try {
    storage.delete(THEME_PREFERENCE_KEY);
    console.log('Preferência de tema removida com sucesso.');
  } catch (error) {
    console.error('Erro ao remover preferência de tema:', error);
  }
};
