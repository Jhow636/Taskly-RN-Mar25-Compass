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
    console.log(
      `taskStorage.saveTask: Salvando tarefa ${task.id} para userId ${userId}. needsSync ANTES de forçar: ${task.needsSync}`,
    );
    // Sempre marcar como needsSync se não for uma operação vinda da API
    // A flag isDeleted já é tratada por quem chama saveTask (ex: deleteTask)
    // Se a tarefa está sendo explicitamente marcada como deletada, ela ainda precisa de sync para o delete.
    task.needsSync = true;
    console.log(
      `taskStorage.saveTask: Tarefa ${task.id} marcada com needsSync: ${task.needsSync}. Conteúdo:`,
      JSON.stringify(task),
    );
    const taskJson = JSON.stringify(task);
    storage.set(taskKey, taskJson);
    console.log(`Tarefa ${task.id} (userId: ${userId}) salva e marcada para sincronização.`);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar tarefa ${task.id} para o usuário ${userId}:`, error);
    return false;
  }
};

/**
 * Busca uma tarefa no MMKV pelo seu ID para um usuário específico.
 * Esta função DEVE continuar retornando null se a tarefa estiver marcada como isDeleted,
 * pois é usada para carregar uma tarefa individual para visualização/edição.
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
      // Se a tarefa está marcada como deletada, não a retorne como uma tarefa "ativa"
      if (task.isDeleted) {
        console.log(
          `taskStorage.getTaskById: Tarefa ${taskId} encontrada, mas está marcada como isDeleted. Retornando null.`,
        );
        return null;
      }
      return task;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Erro ao buscar tarefa ${taskId} para o usuário ${userId}:`, error);
    return null;
  }
};

/**
 * Salva ou atualiza uma tarefa vinda da API no MMKV, garantindo que needsSync seja false.
 * @param task A tarefa da API.
 * @param userId O ID do usuário.
 * @returns true se sucesso, false caso contrário.
 */
export const saveTaskFromApi = (task: Task, userId: string): boolean => {
  if (!userId || !task || !task.id) {
    console.error('saveTaskFromApi: Dados inválidos.');
    return false;
  }
  try {
    const taskKey = getUserTaskKey(userId, task.id);
    // Assegurar que a tarefa da API não seja marcada para nova sincronização
    const taskToSave = {...task, needsSync: false, isDeleted: false};
    const taskJson = JSON.stringify(taskToSave);
    storage.set(taskKey, taskJson);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar tarefa ${task.id} da API para usuário ${userId}:`, error);
    return false;
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
          tasks.push(task);
        } catch (parseError) {
          console.error(`Erro ao parsear dados da tarefa para a chave ${key}:`, parseError);
        }
      }
    });
    tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    console.log(
      `taskStorage.getAllTasks: Encontradas ${tasks.length} tarefas (incluindo marcadas para deleção) para o usuário ${userId}.`,
    );
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
  console.log(
    `taskStorage.setTaskCompletion: Chamado para taskId: ${taskId}, isCompleted: ${isCompleted}, userId: ${userId}`,
  );
  let task = getTaskById(taskId, userId); // Mude para let

  if (task) {
    console.log(
      `taskStorage.setTaskCompletion: Tarefa ${taskId} encontrada localmente. Estado atual isCompleted: ${task.isCompleted}`,
    );
  } else {
    // Se a tarefa não existe localmente, criamos um "shell" para ela.
    // A API PUT /tasks/:id deve ser capaz de lidar com isso, atualizando apenas os campos fornecidos.
    // O mais importante é 'done' (isCompleted). Outros campos são para a estrutura do payload.
    console.warn(
      `taskStorage.setTaskCompletion: Tarefa ${taskId} NÃO encontrada localmente para userId ${userId}. Criando shell para sincronização.`,
    );
    task = {
      id: taskId,
      title: `Task ${taskId}`, // Um título genérico, a API idealmente não o alteraria se não fosse a intenção
      description: '', // Default
      isCompleted: isCompleted, // O valor que queremos definir
      createdAt: new Date(0).toISOString(), // Data antiga para indicar que não é uma nova criação real
      updatedAt: new Date().toISOString(), // Atualizado agora
      dueDate: '',
      priority: 'MÉDIA',
      tags: [],
      subtasks: [],
      needsSync: false, // saveTask vai definir para true
      isDeleted: false,
    };
  }

  task.isCompleted = isCompleted;
  if (isCompleted) {
    // Se estamos criando um shell, ele não terá subtasks para iterar aqui, o que é ok.
    // Se a tarefa existia, suas subtarefas serão marcadas.
    task.subtasks.forEach(sub => {
      sub.isCompleted = true;
    });
  }
  // Se !isCompleted, as subtarefas mantêm seu estado individual (se existirem).

  console.log(
    `taskStorage.setTaskCompletion: Chamando saveTask para ${taskId} com isCompleted: ${task.isCompleted}`,
  );
  return saveTask(task, userId); // saveTask definirá needsSync = true
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
    // task.needsSync = true; // saveTask cuidará disso
    console.log(`Tarefa ${taskId} (userId: ${userId}) marcada para exclusão e sincronização.`);
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
      id: generateUniqueId(), // ID local para a subtarefa
      text: subtaskText.trim(),
      isCompleted: false,
    };
    task.subtasks.push(newSubtask);
    // task.needsSync = true; // saveTask cuidará disso
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
      // task.needsSync = true; // saveTask cuidará disso
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
        // Se uma subtarefa é desmarcada, a tarefa pai também não está completa
        task.isCompleted = false;
      } else {
        // Se uma subtarefa é marcada, verificar se todas as outras estão completas
        const allSubtasksCompleted = task.subtasks.every(sub => sub.isCompleted);
        if (allSubtasksCompleted) {
          task.isCompleted = true;
        }
      }
      // task.needsSync = true; // saveTask cuidará disso
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
      // task.needsSync = true; // saveTask cuidará disso
      return saveTask(task, userId);
    }
  }
  return false;
};

/**
 * Remove uma tarefa do armazenamento local. Usado após sincronização bem-sucedida com a API.
 * @param taskId O ID da tarefa a ser removida.
 * @param userId O ID do usuário proprietário da tarefa.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
 */
export const markTaskAsSyncedAndRemove = (taskId: string, userId: string): boolean => {
  if (!userId || !taskId) {
    console.error('Erro ao remover tarefa sincronizada: ID do usuário ou da tarefa não fornecido.');
    return false;
  }
  try {
    const taskKey = getUserTaskKey(userId, taskId);
    if (storage.contains(taskKey)) {
      storage.delete(taskKey);
      console.log(`Tarefa local ${taskId} (userId: ${userId}) removida após sincronização.`);
      return true;
    }
    console.warn(
      `Tarefa local ${taskId} (userId: ${userId}) não encontrada para remoção pós-sincronização.`,
    );
    return false;
  } catch (error) {
    console.error(
      `Erro ao remover tarefa local ${taskId} (userId: ${userId}) após sincronização:`,
      error,
    );
    return false;
  }
};
