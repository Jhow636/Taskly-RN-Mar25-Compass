import { storage } from '../../App';
import { Task, Subtask } from '../data/models/Task';
import { generateUniqueId } from '../utils/idGenerator';

// Prefixo para as chaves de tarefas no MMKV para evitar colisões
const TASK_STORAGE_PREFIX = 'task_';

/**
 * Salva ou atualiza uma tarefa no MMKV.
 * @param task O objeto Task a ser salvo.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
*/
export const saveTask = (task: Task): boolean => {
    if (!task || !task.id) {
        console.error('Erro ao salvar tarefa: ID da tarefa inválido.');
        return false;
    }
    try {
        const taskKey = `${TASK_STORAGE_PREFIX}${task.id}`;
        // Atualiza a data de modificação e marca para sincronização
        task.updatedAt = new Date().toISOString();
        task.needsSync = true;
        const taskJson = JSON.stringify(task);
        storage.set(taskKey, taskJson);
        console.log(`Tarefa ${task.id} salva com sucesso.`);
        return true;
    } catch (error) {
        console.error(`Erro ao salvar tarefa ${task.id}:`, error);
        return false;
    }
};

/**
 * Busca uma tarefa no MMKV pelo seu ID.
 * @param taskId O ID da tarefa a ser buscada.
 * @returns O objeto Task se encontrado, ou null caso contrário.
*/
export const getTaskById = (taskId: string): Task | null => {
    if (!taskId) {
        return null;
    }
    try {
        const taskKey = `${TASK_STORAGE_PREFIX}${taskId}`;
        const taskJson = storage.getString(taskKey);

        if (taskJson) {
            const task: Task = JSON.parse(taskJson);
            return task.isDeleted ? null : task; // Retorna null se a tarefa estiver marcada como deletada
        } else {
            return null; // Retorna null se a tarefa não for encontrada
        }
    } catch (error) {
        console.error(`Erro ao buscar tarefa ${taskId}:`, error);
        return null;
    }
};

/**
 * Busca todas as tarefas salvas no MMKV.
 * @returns Uma lista de objetos Task.
*/
export const getAllTasks = (): Task[] => {
    try {
        const allKeys = storage.getAllKeys();
        const taskKeys = allKeys.filter(key => key.startsWith(TASK_STORAGE_PREFIX));
        const tasks: Task[] = [];

        taskKeys.forEach(key => {
            const taskJson = storage.getString(key);
            if (taskJson) {
                try {
                    const task: Task = JSON.parse(taskJson);
                    // Adiciona à lista apenas se não estiver marcada como deletada
                    if (!task.isDeleted) {
                        tasks.push(task);
                    }
                } catch (parseError) {
                    console.error(`Erro ao parsear dados da tarefa para a chave ${key}:`, parseError);
                }
            }
        });
        // Ordena as tarefas, por exemplo, por data de criação (mais recentes primeiro)
        tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return tasks;
    } catch (error) {
        console.error('Erro ao buscar todas as tarefas:', error);
        return [];
    }
};

/**
 * Marca uma tarefa como concluída ou não concluída.
 * @param taskId O ID da tarefa a ser atualizada.
 * @param isCompleted O novo status de conclusão.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
*/
export const setTaskCompletion = (taskId: string, isCompleted: boolean): boolean => {
    const task = getTaskById(taskId);
    if (task) {
        task.isCompleted = isCompleted;
        // Marca subtarefas também se a tarefa principal for concluída
        if (isCompleted) {
            task.subtasks.forEach(sub => { sub.isCompleted = true; });
        }
        return saveTask(task);
    }
    return false;
};

/**
 * Marca uma tarefa para exclusão (soft delete).
 * A remoção física ocorrerá após a sincronização.
 * @param taskId O ID da tarefa a ser marcada para exclusão.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
*/
export const deleteTask = (taskId: string): boolean => {
    const task = getTaskById(taskId);
    if (task) {
        task.isDeleted = true;
        task.needsSync = true;
        task.updatedAt = new Date().toISOString();

        try {
            const taskKey = `${TASK_STORAGE_PREFIX}${taskId}`;
            const taskJson = JSON.stringify(task);
            storage.set(taskKey, taskJson);
            console.log(`Tarefan ${taskId} marcada para exclusão.`);
            return true;
        } catch (error) {
            console.error(`Erro ao marcar tarefa ${taskId} para exclusão:`, error);
            return false;
        }
    }
    return !task;
};

// --- Funções para Subtarefas ---

/**
 * Adiciona uma subtarefa a uma tarefa existente.
 * @param taskId O ID da tarefa principal.
 * @param subtaskText O texto da nova subtarefa.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
*/
export const addSubtask = (taskId: string, subtaskText: string): boolean => {
    const task = getTaskById(taskId);
    if (task && subtaskText.trim()) {
        const newSubtask: Subtask = {
            id: generateUniqueId(),
            text: subtaskText.trim(),
            isCompleted: false,
        };
        task.subtasks.push(newSubtask);
        return saveTask(task);
    }
    return false;
};

/**
 * Atualiza o texto de uma subtarefa existente.
 * @param taskId O ID da tarefa principal.
 * @param subtaskId O ID da subtarefa a ser atualizada.
 * @param newText O novo texto para a subtarefa.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
 */
export const updateSubtaskText = (taskId: string, subtaskId: string, newText: string): boolean => {
    const task = getTaskById(taskId);
    if (task && newText.trim()) {
        const subtaskIndex = task.subtasks.findIndex(sub => sub.id === subtaskId);
        if (subtaskIndex !== -1) {
            task.subtasks[subtaskIndex].text = newText.trim();
            return saveTask(task);
        }
    }
    return false;
};


/**
 * Atualiza o status de conclusão de uma subtarefa.
 * @param taskId O ID da tarefa principal.
 * @param subtaskId O ID da subtarefa a ser atualizada.
 * @param isCompleted O novo status de conclusão.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
*/
export const setSubtaskCompletion = (taskId: string, subtaskId: string, isCompleted: boolean): boolean => {
    const task = getTaskById(taskId);
    if (task) {
        const subtaskIndex = task.subtasks.findIndex(sub => sub.id === subtaskId);
        if (subtaskIndex !== -1) {
            task.subtasks[subtaskIndex].isCompleted = isCompleted;
            // Se desmarcar uma subtarefa, desmarca a tarefa principal também
            if (!isCompleted) {
                task.isCompleted = false;
            }
            // Verifica se todas as subtarefas estão completas para marcar a principal
            else {
                const allSubtasksCompleted = task.subtasks.every(sub => sub.isCompleted);
                if (allSubtasksCompleted) {
                    task.isCompleted = true;
                }
            }
            return saveTask(task);
        }
    }
    return false;
};

/**
 * Remove uma subtarefa de uma tarefa.
 * @param taskId O ID da tarefa principal.
 * @param subtaskId O ID da subtarefa a ser removida.
 * @returns true se a operação foi bem-sucedida, false caso contrário.
*/
export const deleteSubtask = (taskId: string, subtaskId: string): boolean => {
    const task = getTaskById(taskId);
    if (task) {
        const initialLength = task.subtasks.length;
        task.subtasks = task.subtasks.filter(sub => sub.id !== subtaskId);
        // Se uma subtarefa foi removida, salva a tarefa
        if (task.subtasks.length < initialLength) {
            return saveTask(task);
        }
    }
    return false;
};
