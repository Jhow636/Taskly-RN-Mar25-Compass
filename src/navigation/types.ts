export type AuthStackParamList = {
  Login: undefined; // Tela de login, não espera parâmetros
  Signup: undefined;
  AvatarSelection: {
    userData: {
      fullName: string;
      email: string;
      phone: string;
    };
    password: string;
  };
};

export type MainStackParamList = {
  Home: undefined; // Tela inicial, não espera parâmetros
  TaskDetails: {taskId: string}; // Tela de detalhes, espera o ID da tarefa
  EditTask: {taskId: string}; // Tela de edição, espera o ID da tarefa
  Preferences: undefined; // Tela de preferências, não espera parâmetros
  Menu:undefined;
  Terms:undefined;
  Preferencies:undefined;
  DarkMode:undefined;
  AvatarUpdate:undefined;
  UserEdit:undefined;
  // Adicione outras telas principais aqui
};
