import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, Pressable, ActivityIndicator, Image } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MainStackParamList } from '../../navigation/types';
import { Task, Subtask } from '../../data/models/Task'; // Importa Task e Subtask
import { getAllTasks, setTaskCompletion } from '../../storage/taskStorage'; // Importa funções de storage
import { useHomeStyles } from './HomeStyles'; // Estilos para esta tela
import { useTheme } from '../../theme/ThemeContext'; // Contexto do tema

// Define o tipo de navegação para esta tela
type HomeScreenNavigationProp = NativeStackNavigationProp<
    MainStackParamList,
    'Home'
>;

// --- Componente para o Item da Tarefa ---
// (Pode ser movido para src/components/TaskItem.tsx depois)
interface TaskItemProps {
    task: Task;
    onPress: () => void;
    onToggleComplete: () => void;
}

const TaskItem = ({ task, onPress, onToggleComplete }: TaskItemProps) => {
    const styles = useHomeStyles();
    const { theme } = useTheme();

    return (
        <Pressable onPress={onPress} style={styles.taskItem}>
            {/* Informações da Tarefa (Título, Descrição, Tags) */}
            <View style={styles.taskInfo}>
                <Text style={styles.taskTitle}>
                    {task.title}
                </Text>
                {task.description && (
                    <Text style={styles.taskDescription} numberOfLines={2}>
                        {task.description}
                    </Text>
                )}
                {/* Container para Tags */}
                {task.tags && task.tags.length > 0 && (
                    <View style={styles.tagsContainer}>
                        {task.tags.map((tag, index) => (
                            <View key={index} style={styles.tag}>
                                <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Indicador de Conclusão (Checkbox simulado) */}
            {/* <Pressable onPress={onToggleComplete} hitSlop={10}>
                <View style={[styles.completionIndicator, task.isCompleted && styles.completionIndicatorChecked]}>
                    {task.isCompleted && (
                        // Substitua por um ícone de check (ex: de react-native-vector-icons)
                        <Text style={{ color: theme.colors.secondaryBg, fontSize: 14, fontWeight: 'bold' }}>✓</Text>
                        // <Image source={require('../../assets/img/check-icon.png')} style={styles.checkmark} />
                    )}
                </View>
            </Pressable> */}
        </Pressable>
    );
};

// --- Componente para o Estado Vazio ---
const EmptyState = ({ onCreatePress }: { onCreatePress: () => void }) => {
    const styles = useHomeStyles();
    const { theme } = useTheme();
    return (
        <View style={styles.emptyContainer}>
            {/* Use um ícone apropriado */}
            <Image
                source={require('../../assets/img/empty-face.png')} // Crie ou use um ícone
                style={styles.emptyIcon}
                resizeMode="contain"
            />
            <Text style={styles.emptyText}>
                No momento você não possui tarefas. Que tal criar uma?
            </Text>
            <Pressable onPress={onCreatePress} style={styles.buttonPrimary}>
                 <Text style={styles.buttonPrimaryText}>Criar Tarefa</Text>
            </Pressable>
        </View>
    );
};

// --- Tela Principal (HomeScreen / TaskListScreen) ---
const HomeScreen = () => {
    const styles = useHomeStyles();
    const { theme } = useTheme();
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Função para carregar as tarefas do MMKV
    const loadTasks = useCallback(() => {
        setIsLoading(true);
        try {
            const storedTasks = getAllTasks();
            setTasks(storedTasks);
        } catch (error) {
            console.error('Erro ao carregar tarefas:', error);
            // Tratar erro (ex: mostrar mensagem para o usuário)
        } finally {
            setIsLoading(false);
        }
    }, []);

    // useFocusEffect para recarregar as tarefas quando a tela recebe foco
    useFocusEffect(
        useCallback(() => {
            loadTasks();
            // Função de cleanup (opcional)
            return () => {
                // console.log("Saindo da tela Home");
            };
        }, [loadTasks]) // Dependência: loadTasks
    );

    // Navega para a tela de detalhes da tarefa
    const handleTaskPress = (taskId: string) => {
        navigation.navigate('TaskDetail', { taskId });
    };

    // Navega para a tela de criação de tarefa
    const handleCreateTaskPress = () => {
        navigation.navigate('CreateTask');
    };

    // Alterna o status de conclusão da tarefa
    const handleToggleComplete = (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const success = setTaskCompletion(taskId, !task.isCompleted);
            if (success) {
                // Atualiza o estado local para refletir a mudança imediatamente
                setTasks(prevTasks =>
                    prevTasks.map(t =>
                        t.id === taskId ? { ...t, isCompleted: !t.isCompleted, subtasks: t.subtasks.map(sub => ({...sub, isCompleted: !task.isCompleted ? true : sub.isCompleted })) } : t // Atualiza subtarefas se necessário
                    )
                );
            } else {
                console.error("Falha ao atualizar status da tarefa:", taskId);
                // Mostrar erro ao usuário, se necessário
            }
        }
    };


    // Renderiza o indicador de loading
    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={tasks}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        onPress={() => handleTaskPress(item.id)}
                        onToggleComplete={() => handleToggleComplete(item.id)}
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContentContainer}
                ListEmptyComponent={<EmptyState onCreatePress={handleCreateTaskPress} />} // Componente para lista vazia
            />
        </View>
    );
};

export default HomeScreen;
