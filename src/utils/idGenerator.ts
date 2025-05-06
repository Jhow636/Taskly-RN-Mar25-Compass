/**
 * Gera um ID pseudo-único baseado no tempo e um número aleatório.
 * Suficiente para uso local, mas considere UUIDs para produção/backend.
 * @returns Uma string de ID única.
 */
export const generateUniqueId = (): string => {
  // Combina timestamp com uma string aleatória para aumentar a unicidade
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 15);
};
