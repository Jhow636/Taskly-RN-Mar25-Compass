const API_URL = 'http://15.229.11.44:3000';

export const registerUser = async (
  email: string,
  password: string,
  fullName: string,
  phone: string,
  avatarId: string,
) => {
  const response = await fetch(`${API_URL}/auth/register`, {
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
  if (!response.ok) throw new Error(data.message || 'Erro ao registrar');
  return data;
};
