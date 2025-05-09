import {Task as TaskModel} from '../data/models/Task';

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
  TaskDetails: {task: TaskModel}; // Espera o objeto Task completo
  EditTask: {taskId: string}; // Espera o id do objeto Task
  Preferences: undefined; // Tela de preferências, não espera parâmetros
  Menu: undefined;
  Terms: undefined;
  Preferencies: undefined;
  DarkMode: undefined;
  AvatarUpdate: undefined;
  UserEdit: undefined;
  // Adicione outras telas principais aqui
};
