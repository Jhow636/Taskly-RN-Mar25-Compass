// Define a estrutura para uma subtarefa
export interface Subtask {
    id: string;
    text: string;
    isCompleted: boolean;
}

// Define os níveis de prioridade
export type Priority = 'ALTA' | 'MÉDIA' | 'BAIXA';

// Define a estrutura principal da Tarefa
export interface Task {
    id: string;
    title: string;
    description: string;
    dueDate: string;
    priority: Priority;
    tags: string[];
    subtasks: Subtask[];
    isCompleted: boolean;
    createdAt: string;
    updatedAt: string;
    needsSync: boolean;
    isDeleted?: boolean;
}
