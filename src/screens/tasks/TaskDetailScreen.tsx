import React, {useState, useCallback} from 'react';
import {View, ScrollView, ActivityIndicator, Alert, Text} from 'react-native';
import {RouteProp, useRoute, useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {MainStackParamList} from '../../navigation/types';
import {Task} from '../../data/models/Task';
import {
  getTaskById,
  setTaskCompletion,
  deleteTask,
  addSubtask,
  setSubtaskCompletion,
  deleteSubtask,
} from '../../storage/taskStorage';
import {useTheme} from '../../theme/ThemeContext';
import {useTaskDetailStyles} from './TaskDetailStyles';
import TaskDetailCard from '../../components/tasks/TaskDetailCard';
import SubtaskListSection from '../../components/tasks/SubtaskListSection';

type TaskDetailScreenRouteProp = RouteProp<MainStackParamList, 'TaskDetails'>;
type TaskDetailScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'TaskDetails'>;

// --- Tela Principal de Detalhes ---
const TaskDetailScreen = () => {
  const styles = useTaskDetailStyles();
  const {theme} = useTheme();
  const route = useRoute<TaskDetailScreenRouteProp>();
  const navigation = useNavigation<TaskDetailScreenNavigationProp>();
  const {taskId} = route.params;

  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadTaskDetails = useCallback(() => {
    setIsLoading(true);
    const fetchedTask = getTaskById(taskId);
    if (fetchedTask) {
      setTask(fetchedTask);
    } else {
      // Tarefa não encontrada ou deletada, voltar ou mostrar mensagem
      Alert.alert('Erro', 'Tarefa não encontrada.', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
      setTask(null);
    }
    setIsLoading(false);
  }, [taskId, navigation]);

  // Carrega a tarefa quando a tela recebe foco
  useFocusEffect(loadTaskDetails);

  // --- Handlers ---

  const handleToggleTaskComplete = () => {
    if (!task) {
      return;
    }
    const success = setTaskCompletion(task.id, !task.isCompleted);
    if (success) {
      // Atualiza estado local e volta (HomeScreen vai recarregar)
      setTask(prev => (prev ? {...prev, isCompleted: !prev.isCompleted} : null));
      navigation.goBack(); // Ou pode só atualizar o estado se preferir ficar na tela
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar o status da tarefa.');
    }
  };

  const handleEditTask = () => {
    if (!task) {
      return;
    }
    // Navega para a tela de edição (precisa ser criada e adicionada ao AppNavigator)
    // navigation.navigate('EditTask', { taskId: task.id });
    Alert.alert('Em breve', 'A tela de edição ainda será implementada.');
  };

  const handleDeleteTask = () => {
    if (!task) {
      return;
    }
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta tarefa e todas as suas subtarefas?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            const success = deleteTask(task.id);
            if (success) {
              navigation.goBack(); // Volta para HomeScreen
            } else {
              Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
            }
          },
        },
      ],
    );
  };

  const handleAddSubtask = (text: string) => {
    if (!task) {
      return;
    }
    const success = addSubtask(task.id, text);
    if (success) {
      loadTaskDetails(); // Recarrega os detalhes para mostrar a nova subtarefa
    } else {
      Alert.alert('Erro', 'Não foi possível adicionar a subtarefa.');
    }
  };

  const handleToggleSubtaskComplete = (subtaskId: string) => {
    if (!task) {
      return;
    }
    const subtask = task.subtasks.find(sub => sub.id === subtaskId);
    if (!subtask) {
      return;
    }

    const success = setSubtaskCompletion(task.id, subtaskId, !subtask.isCompleted);
    if (success) {
      loadTaskDetails(); // Recarrega para refletir a mudança
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar o status da subtarefa.');
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    if (!task) {
      return;
    }
    Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja excluir esta subtarefa?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          const success = deleteSubtask(task.id, subtaskId);
          if (success) {
            loadTaskDetails(); // Recarrega para remover a subtarefa da lista
          } else {
            Alert.alert('Erro', 'Não foi possível excluir a subtarefa.');
          }
        },
      },
    ]);
  };

  // --- Renderização ---

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    // Envolve tudo com GestureHandlerRootView
    <GestureHandlerRootView style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        {/* Card Principal com Swipe para Deletar */}
        {task && (
          <TaskDetailCard
            task={task}
            onEdit={handleEditTask}
            onToggleComplete={handleToggleTaskComplete}
            onDelete={handleDeleteTask}
          />
        )}

        {/* Seção de Subtarefas */}
        {task && (
          <SubtaskListSection
            subtasks={task.subtasks}
            onAddSubtask={handleAddSubtask}
            onToggleSubtask={handleToggleSubtaskComplete}
            onDeleteSubtask={handleDeleteSubtask}
          />
        )}

        {/* Mensagem de erro se a tarefa não for encontrada após o loading */}
        {!isLoading && !task && (
          <View style={styles.container}>
            <Text style={styles.errorText}>Tarefa não encontrada.</Text>
          </View>
        )}
      </ScrollView>
    </GestureHandlerRootView>
  );
};

export default TaskDetailScreen;
