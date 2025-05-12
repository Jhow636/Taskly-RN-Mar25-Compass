import React, {useState, useCallback} from 'react';
import {View, ScrollView, ActivityIndicator, Alert, Text} from 'react-native';
import {RouteProp, useRoute, useNavigation, useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

import {MainStackParamList} from '../../navigation/types';
import {Task as TaskModel, Subtask} from '../../data/models/Task';
import {useAuth} from '../../context/AuthContext';
import {
  setTaskCompletion,
  deleteTask as deleteTaskFromStorage,
  addSubtask,
  setSubtaskCompletion,
  deleteSubtask,
  getTaskById as getLocalTaskById,
  updateSubtaskText as updateLocalSubtaskText,
} from '../../storage/taskStorage';
import {useTheme} from '../../theme/ThemeContext';
import {useTaskDetailStyles} from './TaskDetailStyles';
import TaskDetailCard from '../../components/tasks/TaskDetailCard';
import SubtaskListSection from '../../components/tasks/SubtaskListSection';
import HeaderIntern from '../../components/HeaderIntern/Index';

type TaskDetailScreenRouteProp = RouteProp<MainStackParamList, 'TaskDetails'>;
type TaskDetailScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'TaskDetails'>;

const TaskDetailScreen = () => {
  const styles = useTaskDetailStyles();
  const {theme} = useTheme();
  const route = useRoute<TaskDetailScreenRouteProp>();
  const navigation = useNavigation<TaskDetailScreenNavigationProp>();
  const {userId, triggerSync} = useAuth();

  const [task, setTask] = useState<TaskModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const reloadTaskFromLocal = useCallback(() => {
    if (userId && route.params.task?.id) {
      const refreshedTask = getLocalTaskById(route.params.task.id, userId);
      if (refreshedTask) {
        setTask(refreshedTask);
        navigation.setOptions({title: refreshedTask.title});
      } else {
        setTask(null);
        Alert.alert(
          'Tarefa não encontrada',
          'Esta tarefa pode ter sido removida ou não está mais acessível.',
          [{text: 'OK', onPress: () => navigation.goBack()}],
        );
      }
    }
  }, [userId, route.params.task?.id, navigation]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      const taskIdFromParams = route.params.task?.id;
      if (taskIdFromParams && userId) {
        const refreshedTask = getLocalTaskById(taskIdFromParams, userId);
        if (refreshedTask) {
          setTask(refreshedTask);
          navigation.setOptions({title: refreshedTask.title});
        } else {
          setTask(null);
        }
      } else if (route.params.task && !userId) {
        setTask(route.params.task);
        navigation.setOptions({title: route.params.task.title});
      } else {
        setTask(null);
      }
      setIsLoading(false);
    }, [userId, route.params.task, navigation]),
  );

  const handleToggleTaskComplete = () => {
    if (!task || !userId) {
      return;
    }
    const newCompletedStatus = !task.isCompleted;
    const updatedTaskState: TaskModel = {
      ...task,
      isCompleted: newCompletedStatus,
      subtasks: newCompletedStatus
        ? task.subtasks.map((st: Subtask) => ({...st, isCompleted: true}))
        : task.subtasks,
    };
    setTask(updatedTaskState);

    const success = setTaskCompletion(task.id, newCompletedStatus, userId);
    if (success) {
      console.log(
        `TaskDetailScreen: Task ${task.id} completion status updated locally. Triggering sync.`,
      );
      triggerSync();
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar o status da tarefa localmente.');
      const originalTask = getLocalTaskById(task.id, userId);
      setTask(originalTask || route.params.task);
    }
  };

  const handleEditTask = () => {
    if (!task || !task.id) {
      Alert.alert('Erro', 'ID da tarefa não encontrado para edição.');
      return;
    }
    navigation.navigate('EditTask', {taskId: task.id});
  };

  const handleDeleteTask = () => {
    if (!task || !userId) {
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
            const success = deleteTaskFromStorage(task.id, userId);
            if (success) {
              console.log(
                `TaskDetailScreen: Task ${task.id} marked for deletion locally. Triggering sync.`,
              );
              triggerSync();
              navigation.goBack();
            } else {
              Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
            }
          },
        },
      ],
    );
  };

  const handleAddSubtaskConfirmedFromSection = (subtaskText: string) => {
    if (!task || !userId) {
      Alert.alert('Erro', 'Não foi possível adicionar a subtarefa. Dados da tarefa ausentes.');
      return;
    }
    const success = addSubtask(task.id, subtaskText, userId);
    if (success) {
      reloadTaskFromLocal();
      triggerSync();
      console.log(`TaskDetailScreen: Subtask "${subtaskText}" added to ${task.id}.`);
    } else {
      Alert.alert('Erro', 'Não foi possível adicionar a subtarefa localmente.');
    }
  };

  const handleToggleSingleSubtaskComplete = (subtaskId: string) => {
    if (!task || !userId) {
      return;
    }
    const subtaskToToggle = task.subtasks.find((sub: Subtask) => sub.id === subtaskId);
    if (!subtaskToToggle) {
      return;
    }

    const newSubtaskCompletedStatus = !subtaskToToggle.isCompleted;
    const success = setSubtaskCompletion(task.id, subtaskId, newSubtaskCompletedStatus, userId);
    if (success) {
      reloadTaskFromLocal();
      console.log(
        `TaskDetailScreen: Subtask ${subtaskId} in task ${task.id} toggled. Triggering sync.`,
      );
      triggerSync();
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar o status da subtarefa localmente.');
    }
  };

  const handleDeleteSingleSubtask = (subtaskId: string) => {
    if (!task || !userId) {
      return;
    }
    Alert.alert('Confirmar Exclusão', 'Tem certeza que deseja excluir esta subtarefa?', [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: () => {
          const success = deleteSubtask(task.id, subtaskId, userId);
          if (success) {
            reloadTaskFromLocal();
            console.log(
              `TaskDetailScreen: Subtask ${subtaskId} in task ${task.id} deleted. Triggering sync.`,
            );
            triggerSync();
          } else {
            Alert.alert('Erro', 'Não foi possível excluir a subtarefa localmente.');
          }
        },
      },
    ]);
  };

  const handleUpdateSubtaskText = (subtaskId: string, newText: string) => {
    if (!task || !userId) {
      Alert.alert('Erro', 'Não foi possível atualizar a subtarefa. Dados ausentes.');
      return;
    }
    const success = updateLocalSubtaskText(task.id, subtaskId, newText, userId);
    if (success) {
      reloadTaskFromLocal();
      console.log(
        `TaskDetailScreen: Subtask ${subtaskId} in task ${task.id} text updated to "${newText}". Triggering sync.`,
      );
      triggerSync();
    } else {
      Alert.alert('Erro', 'Não foi possível atualizar o texto da subtarefa localmente.');
    }
  };

  if (isLoading || isSyncing) {
    return (
      <View style={[styles.container, {justifyContent: 'center', alignItems: 'center'}]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{marginTop: 10, color: theme.colors.mainText}}>
          {isSyncing ? 'Sincronizando tarefa...' : 'Carregando tarefa...'}
        </Text>
      </View>
    );
  }

  if (!task) {
    return (
      <GestureHandlerRootView style={styles.root}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={[
            styles.scrollContent,
            {flexGrow: 1, justifyContent: 'center', alignItems: 'center'},
          ]}>
          <Text style={styles.errorText}>
            Detalhes da tarefa não disponíveis ou tarefa removida.
          </Text>
        </ScrollView>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <HeaderIntern />
        <TaskDetailCard
          task={task}
          onEdit={handleEditTask}
          onToggleComplete={handleToggleTaskComplete}
          onDelete={handleDeleteTask}
        />

        <SubtaskListSection
          subtasks={task.subtasks}
          onToggleSubtask={handleToggleSingleSubtaskComplete}
          onDeleteSubtask={handleDeleteSingleSubtask}
          onAddSubtaskConfirmed={handleAddSubtaskConfirmedFromSection}
          onUpdateSubtaskText={handleUpdateSubtaskText}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
};

export default TaskDetailScreen;
