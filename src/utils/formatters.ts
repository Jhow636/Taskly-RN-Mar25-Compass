// Pode ser em src/utils/formatters.ts ou no topo de src/components/userInfo/index.tsx
export const formatBrazilianPhoneNumber = (phoneNumber: string | undefined): string => {
  if (!phoneNumber) {
    return ''; // Ou 'Telefone não informado'
  }

  // Remove todos os caracteres não numéricos
  const cleaned = ('' + phoneNumber).replace(/\D/g, '');

  // Verifica o comprimento do número para aplicar a formatação correta
  // (XX) XXXXX-XXXX para números com 11 dígitos (celular com nono dígito)
  // (XX) XXXX-XXXX para números com 10 dígitos (fixo ou celular antigo)
  const matchMobile = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
  if (matchMobile) {
    return `(${matchMobile[1]}) ${matchMobile[2]}-${matchMobile[3]}`;
  }

  const matchLandline = cleaned.match(/^(\d{2})(\d{4})(\d{4})$/);
  if (matchLandline) {
    return `(${matchLandline[1]}) ${matchLandline[2]}-${matchLandline[3]}`;
  }

  // Se não corresponder a nenhum formato conhecido, retorna o número limpo ou original
  return phoneNumber;
};
