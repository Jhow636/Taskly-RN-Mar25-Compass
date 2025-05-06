export const validateFullName = (fullName: string): string | null => {
  if (!fullName) {
    return 'O nome é obrigatório';
  }

  if (fullName.length > 120) {
    return 'O nome deve ter no máximo 120 caracteres';
  }

  // Verifica se o nome é composto (pelo menos dois nomes)
  const names = fullName
    .trim()
    .split(' ')
    .filter(name => name.length > 0);
  if (names.length < 2) {
    return 'Informe nome e sobrenome';
  }

  return null;
};

// Validação para email
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return 'O e-mail é obrigatório';
  }

  // Regex para validar formato de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Formato de e-mail inválido';
  }

  return null;
};

// Validação para telefone
export const validatePhone = (phone: string): string | null => {
  if (!phone) {
    return 'O telefone é obrigatório';
  }

  // Regex para formato (DDD) 9 dddd-dddd
  const phoneRegex = /^\(\d{2}\)\s9\s\d{4}-\d{4}$/;
  if (!phoneRegex.test(phone)) {
    return 'Formato deve ser: (DD) 9 dddd-dddd';
  }

  return null;
};

// Validação para senha
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'A senha é obrigatória';
  }

  if (password.length < 8) {
    return 'A senha deve ter no mínimo 8 caracteres';
  }

  if (password.length > 20) {
    return 'A senha deve ter no máximo 20 caracteres';
  }

  // Verificar se tem pelo menos um caractere especial
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'A senha deve conter pelo menos um caractere especial';
  }

  // Verificar se tem pelo menos uma letra minúscula
  if (!/[a-z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra minúscula';
  }

  // Verificar se tem pelo menos uma letra maiúscula
  if (!/[A-Z]/.test(password)) {
    return 'A senha deve conter pelo menos uma letra maiúscula';
  }

  return null;
};

// Validação para confirmação de senha
export const validatePasswordConfirmation = (
  password: string,
  confirmation: string,
): string | null => {
  if (!confirmation) {
    return 'A confirmação de senha é obrigatória';
  }

  if (password !== confirmation) {
    return 'As senhas não coincidem';
  }

  return null;
};

// Função para formatar o telefone enquanto o usuário digita
export const formatPhoneNumber = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, '');

  // Aplica a formatação (DD) 9 dddd-dddd
  if (numbers.length <= 2) {
    return numbers.length ? `(${numbers}` : '';
  } else if (numbers.length <= 3) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  } else if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(
      3,
    )}`;
  } else if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(
      3,
      7,
    )}-${numbers.slice(7)}`;
  } else {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 3)} ${numbers.slice(
      3,
      7,
    )}-${numbers.slice(7, 11)}`;
  }
};
