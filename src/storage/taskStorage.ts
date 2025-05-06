import {storage} from '../../App';
import {Task, Subtask} from '../data/models/Task';
import {generateUniqueId} from '../utils/idGenerator';

// Prefixo para as chaves de tarefas no MMKV para evitar colisões
const getUserTaskKey = (userId: string, taskId: string): string => {
  if (!userId) {
    throw new Error('User ID is required to generate task key.');
  }
  return `user_${userId}_task_${taskId}`;
};

const getUserTaskPrefix = (userId: string): string => {
  if (!userId) {
    throw new Error('User ID is required to generate task prefix.');
  }
  return `user_${userId}_task_`;
};

/**
 * Salva ou atualiza uma tarefa no MMKV para um usuário específico.
 * @param task O objeto Task a ser salvo.
 * @param userId O ID do usuário proprietário da tarefa.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
 */
export const saveTask = (task: Task, userId: string): boolean => {
  if (!userId) {
    console.error('Erro ao salvar tarefa: ID do usuário não fornecido.');
    return false;
  }
  if (!task || !task.id) {
    console.error('Erro ao salvar tarefa: ID da tarefa inválido.');
    return false;
  }
  try {
    const taskKey = getUserTaskKey(userId, task.id);
    task.updatedAt = new Date().toISOString();
    task.needsSync = true;
    const taskJson = JSON.stringify(task);
    storage.set(taskKey, taskJson);
    console.log(`Tarefa ${task.id} salva para o usuário ${userId}.`);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar tarefa ${task.id} para o usuário ${userId}:`, error);
    return false;
  }
};

/**
 * Busca uma tarefa no MMKV pelo seu ID para um usuário específico.
 * @param taskId O ID da tarefa a ser buscada.
 * @param userId O ID do usuário proprietário da tarefa.
 * @returns O objeto Task se encontrado, ou null caso contrário.
 */
export const getTaskById = (taskId: string, userId: string): Task | null => {
  if (!userId) {
    console.error('Erro ao buscar tarefa: ID do usuário não fornecido.');
    return null;
  }
  if (!taskId) {
    return null;
  }
  try {
    const taskKey = getUserTaskKey(userId, taskId);
    const taskJson = storage.getString(taskKey);

    if (taskJson) {
      const task: Task = JSON.parse(taskJson);
      return task.isDeleted ? null : task;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Erro ao buscar tarefa ${taskId} para o usuário ${userId}:`, error);
    return null;
  }
};

/**
 * Busca todas as tarefas salvas no MMKV para um usuário específico.
 * @param userId O ID do usuário para o qual buscar as tarefas.
 * @returns Uma lista de objetos Task.
 */
export const getAllTasks = (userId: string): Task[] => {
  if (!userId) {
    console.error('Erro ao buscar todas as tarefas: ID do usuário não fornecido.');
    return [];
  }
  try {
    const allKeys = storage.getAllKeys();
    const userTaskKeyPrefix = getUserTaskPrefix(userId);
    const taskKeys = allKeys.filter(key => key.startsWith(userTaskKeyPrefix));
    const tasks: Task[] = [];

    taskKeys.forEach(key => {
      const taskJson = storage.getString(key);
      if (taskJson) {
        try {
          const task: Task = JSON.parse(taskJson);
          if (!task.isDeleted) {
            tasks.push(task);
          }
        } catch (parseError) {
          console.error(`Erro ao parsear dados da tarefa para a chave ${key}:`, parseError);
        }
      }
    });
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    console.log(`Encontradas ${tasks.length} tarefas para o usuário ${userId}.`);
    return tasks;
  } catch (error) {
    console.error(`Erro ao buscar todas as tarefas para o usuário ${userId}:`, error);
    return [];
  }
};

/**
 * Marca uma tarefa como concluída ou não concluída para um usuário específico.
 * @param taskId O ID da tarefa a ser atualizada.
 * @param isCompleted O novo status de conclusão.
 * @param userId O ID do usuário proprietário da tarefa.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
 */
export const setTaskCompletion = (
  taskId: string,
  isCompleted: boolean,
  userId: string,
): boolean => {
  const task = getTaskById(taskId, userId);
  if (task) {
    task.isCompleted = isCompleted;
    if (isCompleted) {
      task.subtasks.forEach(sub => {
        sub.isCompleted = true;
      });
    }
    return saveTask(task, userId);
  }
  return false;
};

/**
 * Marca uma tarefa para exclusão (soft delete) para um usuário específico.
 * @param taskId O ID da tarefa a ser marcada para exclusão.
 * @param userId O ID do usuário proprietário da tarefa.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
 */
export const deleteTask = (taskId: string, userId: string): boolean => {
  const task = getTaskById(taskId, userId);
  if (task) {
    task.isDeleted = true;
    return saveTask(task, userId);
  }
  return false;
};

// --- Funções para Subtarefas (também precisam de userId) ---

/**
 * Adiciona uma subtarefa a uma tarefa existente para um usuário específico.
 * @param taskId O ID da tarefa principal.
 * @param subtaskText O texto da nova subtarefa.
 * @param userId O ID do usuário proprietário da tarefa.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
 */
export const addSubtask = (taskId: string, subtaskText: string, userId: string): boolean => {
  const task = getTaskById(taskId, userId);
  if (task && subtaskText.trim()) {
    const newSubtask: Subtask = {
      id: generateUniqueId(),
      text: subtaskText.trim(),
      isCompleted: false,
    };
    task.subtasks.push(newSubtask);
    return saveTask(task, userId);
  }
  return false;
};

/**
 * Atualiza o texto de uma subtarefa existente para um usuário específico.
 * @param taskId O ID da tarefa principal.
 * @param subtaskId O ID da subtarefa a ser atualizada.
 * @param newText O novo texto para a subtarefa.
 * @param userId O ID do usuário proprietário da tarefa.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
 */
export const updateSubtaskText = (
  taskId: string,
  subtaskId: string,
  newText: string,
  userId: string,
): boolean => {
  const task = getTaskById(taskId, userId);
  if (task && newText.trim()) {
    const subtaskIndex = task.subtasks.findIndex(sub => sub.id === subtaskId);
    if (subtaskIndex !== -1) {
      task.subtasks[subtaskIndex].text = newText.trim();
      return saveTask(task, userId);
    }
  }
  return false;
};

/**
 * Atualiza o status de conclusão de uma subtarefa para um usuário específico.
 * @param taskId O ID da tarefa principal.
 * @param subtaskId O ID da subtarefa a ser atualizada.
 * @param isCompleted O novo status de conclusão.
 * @param userId O ID do usuário proprietário da tarefa.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
 */
export const setSubtaskCompletion = (
  taskId: string,
  subtaskId: string,
  isCompleted: boolean,
  userId: string,
): boolean => {
  const task = getTaskById(taskId, userId);
  if (task) {
    const subtaskIndex = task.subtasks.findIndex(sub => sub.id === subtaskId);
    if (subtaskIndex !== -1) {
      task.subtasks[subtaskIndex].isCompleted = isCompleted;
      if (!isCompleted) {
        task.isCompleted = false;
      } else {
        const allSubtasksCompleted = task.subtasks.every(sub => sub.isCompleted);
        if (allSubtasksCompleted) {
          task.isCompleted = true;
        }
      }
      return saveTask(task, userId);
    }
  }
  return false;
};

/**
 * Remove uma subtarefa de uma tarefa para um usuário específico.
 * @param taskId O ID da tarefa principal.
 * @param subtaskId O ID da subtarefa a ser removida.
 * @param userId O ID do usuário proprietário da tarefa.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
 */
export const deleteSubtask = (taskId: string, subtaskId: string, userId: string): boolean => {
  const task = getTaskById(taskId, userId);
  if (task) {
    const initialLength = task.subtasks.length;
    task.subtasks = task.subtasks.filter(sub => sub.id !== subtaskId);
    if (task.subtasks.length < initialLength) {
      return saveTask(task, userId);
    }
  }
  return false;
};
