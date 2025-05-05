export type AuthStackParamList = {
  Login: undefined; // Tela de login, não espera parâmetros
  Register: undefined; // Tela de registro, não espera parâmetros
  // Adicione outras telas de autenticação aqui
};

export type MainStackParamList = {
  Home: undefined; // Tela inicial, não espera parâmetros
  TaskDetails: {taskId: string}; // Tela de detalhes, espera o ID da tarefa
  EditTask: {taskId: string}; // Tela de edição, espera o ID da tarefa
  // Adicione outras telas principais aqui
};
