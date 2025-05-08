import React, {useState, useCallback, useEffect} from 'react';
import {View, Text, FlatList, Pressable, ActivityIndicator, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../navigation/types';
import {Task as TaskModel} from '../../data/models/Task';
import {
  getAllTasks as getAllLocalTasks,
  setTaskCompletion as setLocalTaskCompletion,
  markTaskAsSyncedAndRemove,
} from '../../storage/taskStorage';
import {
  getTasks as getApiTasks,
  createTask as createApiTask,
  updateTask as updateApiTask,
  deleteTaskApi as deleteApiTask,
  CustomApiError,
} from '../../services/api';
import {useHomeStyles} from './HomeStyles';
import {useTheme} from '../../theme/ThemeContext';
import {useAuth} from '../../context/AuthContext';
import CreateTaskModal from '../../components/modals/CreateTaskModal';
import {AdvancedCheckbox} from 'react-native-advanced-checkbox';
import Header from '../../components/Header';
import EmptyStateComponent from '../../components/EmptyState.tsx';
import LogoutButton from '../../components/LogoutButton';
import {generateUniqueId} from '../../utils/idGenerator';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

interface TaskItemProps {
  task: TaskModel;
  onPress: () => void;
  onToggleComplete: () => void;
}

const TaskItem = ({task, onPress, onToggleComplete}: TaskItemProps) => {
  const styles = useHomeStyles();
  return (
    <View style={styles.taskItem}>
      <View style={styles.taskContent}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <AdvancedCheckbox
            value={task.isCompleted}
            onValueChange={onToggleComplete}
            checkedColor="#32C25B"
            uncheckedColor="#B58B46"
            animationType="bounce"
            checkBoxStyle={styles.taskCheckbox}
            size={20}
          />
        </View>
        {task.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {task.description}
          </Text>
        )}
        {task.tags && task.tags.length > 0 && (
          <FlatList
            horizontal
            data={task.tags}
            renderItem={({item: tag}) => (
              <View style={styles.tag}>
                <Text style={styles.tagText}>{tag.toUpperCase()}</Text>
              </View>
            )}
            keyExtractor={(tag, index) => `${tag}-${index}`}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsListContainer}
          />
        )}
        <Pressable onPress={onPress} style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>Ver Detalhes</Text>
        </Pressable>
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const styles = useHomeStyles();
  const {theme} = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {userId, idToken} = useAuth();
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const prepareTaskPayloadForApi = (
    task: TaskModel,
    isShellForStatusUpdateOnly: boolean = false,
  ) => {
    if (isShellForStatusUpdateOnly) {
      return {
        done: task.isCompleted,
      };
    }
    return {
      title: task.title,
      description: task.description,
      done: task.isCompleted,
      subtasks: task.subtasks.map(st => ({title: st.text, done: st.isCompleted})),
      tags: task.tags,
    };
  };

  const syncLocalTasksWithApi = useCallback(
    async (isManualRefresh = false) => {
      if (!userId || !idToken) {
        setIsLoading(false);
        setTasks([]);
        return;
      }

      if (isSyncing && !isManualRefresh) {
        return;
      }

      console.log(`HomeScreen: Starting sync (manual: ${isManualRefresh}) for userId: ${userId}`);
      setIsSyncing(true);
      if (!isManualRefresh && !initialLoadDone) {
        setIsLoading(true);
      }

      const localTasksToSync = getAllLocalTasks(userId).filter(task => task.needsSync);
      let localSyncOperations = 0;

      for (const localTask of localTasksToSync) {
        const isShellForStatusUpdate = localTask.createdAt === new Date(0).toISOString();
        try {
          const payload = prepareTaskPayloadForApi(localTask, isShellForStatusUpdate);

          if (localTask.isDeleted) {
            console.log(`Sync: Deleting task ${localTask.id} from API.`);
            await deleteApiTask(localTask.id);
            markTaskAsSyncedAndRemove(localTask.id, userId);
            localSyncOperations++;
          } else {
            const isLikelyNewTask = localTask.id.includes('-');

            if (isLikelyNewTask && !isShellForStatusUpdate) {
              console.log(`Sync: Creating new task "${localTask.title}" on API with full payload.`);
              await createApiTask(payload);
              markTaskAsSyncedAndRemove(localTask.id, userId);
              localSyncOperations++;
            } else {
              console.log(
                `Sync: Updating task ${localTask.id} (Title: "${localTask.title}") on API. Is shell for status update: ${isShellForStatusUpdate}`,
              );
              await updateApiTask(localTask.id, payload);
              markTaskAsSyncedAndRemove(localTask.id, userId);
              localSyncOperations++;
            }
          }
        } catch (error) {
          console.error(
            `Sync: Failed to sync task ${localTask.id} (Title: ${localTask.title}):`,
            error,
          );
          if (error instanceof CustomApiError && error.status === 404 && !localTask.isDeleted) {
            if (isShellForStatusUpdate) {
              console.warn(
                `Sync: Shell task ${localTask.id} not found on server (404). Removing local shell.`,
              );
              markTaskAsSyncedAndRemove(localTask.id, userId);
            } else {
              try {
                console.log(
                  `Sync: Update failed (404 for non-shell), attempting to CREATE task ${localTask.title} as fallback.`,
                );
                const createPayload = prepareTaskPayloadForApi(localTask, false);
                await createApiTask(createPayload);
                markTaskAsSyncedAndRemove(localTask.id, userId);
                localSyncOperations++;
              } catch (createError) {
                console.error(
                  `Sync: Fallback CREATE failed for task ${localTask.title}:`,
                  createError,
                );
              }
            }
          }
        }
      }
      console.log(`Sync: ${localSyncOperations} local operations performed.`);

      try {
        console.log('Sync: Fetching all tasks from API.');
        const apiTasksData = await getApiTasks();
        const formattedApiTasks: TaskModel[] = apiTasksData.map((apiTask: any) => ({
          id: apiTask.id,
          title: apiTask.title,
          description: apiTask.description || '',
          isCompleted: apiTask.done,
          createdAt: apiTask.createdAt || new Date().toISOString(),
          updatedAt: apiTask.updatedAt || new Date().toISOString(),
          dueDate: apiTask.dueDate || '',
          priority: apiTask.priority || 'MÉDIA',
          tags: apiTask.tags || [],
          subtasks: (apiTask.subtasks || []).map((st: any) => ({
            id: st.id || generateUniqueId(),
            text: st.title,
            isCompleted: st.done,
          })),
          needsSync: false,
          isDeleted: false,
        }));
        setTasks(formattedApiTasks);
        console.log(
          `Sync: Fetched ${formattedApiTasks.length} tasks from API. Displaying API tasks.`,
        );
      } catch (error) {
        console.error('Sync: Error fetching tasks from API:', error);
        Alert.alert('Erro de Rede', 'Não foi possível buscar suas tarefas. Verifique sua conexão.');
        if (!isManualRefresh) {
          const remainingLocalTasks = getAllLocalTasks(userId);
          setTasks(remainingLocalTasks);
          console.log(
            `Sync: API fetch failed. Displaying ${remainingLocalTasks.length} remaining local tasks.`,
          );
        }
      } finally {
        setIsLoading(false);
        setIsSyncing(false);
        if (!initialLoadDone) {
          setInitialLoadDone(true);
        }
        console.log('HomeScreen: Sync process finished.');
      }
    },
    [userId, idToken, isSyncing, initialLoadDone],
  );

  useEffect(() => {
    if (userId && idToken && !initialLoadDone) {
      console.log('HomeScreen: Initial load effect triggered.');
      syncLocalTasksWithApi(false);
    } else if (!idToken) {
      setTasks([]);
      setIsLoading(false);
      setInitialLoadDone(false);
      console.log('HomeScreen: No token, clearing tasks and resetting initial load state.');
    }
  }, [userId, idToken, initialLoadDone, syncLocalTasksWithApi]);

  const openCreateModal = () => setIsModalVisible(true);
  const closeCreateModal = () => setIsModalVisible(false);

  const handleTaskSaved = () => {
    closeCreateModal();
    if (userId) {
      const currentLocalTasks = getAllLocalTasks(userId);
      setTasks(currentLocalTasks);
      syncLocalTasksWithApi(true);
    }
  };

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskDetails', {taskId});
  };

  const handleToggleComplete = (taskId: string) => {
    if (!userId) {
      console.error('Cannot toggle task completion: User ID is not available.');
      return;
    }
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex > -1) {
      const updatedTasks = [...tasks];
      const taskToToggle = {...updatedTasks[taskIndex]};
      taskToToggle.isCompleted = !taskToToggle.isCompleted;
      if (taskToToggle.isCompleted) {
        taskToToggle.subtasks.forEach(sub => (sub.isCompleted = true));
      }
      updatedTasks[taskIndex] = taskToToggle;
      setTasks(updatedTasks);
      setLocalTaskCompletion(taskId, taskToToggle.isCompleted, userId);
      const localUpdateSuccess = setLocalTaskCompletion(taskId, taskToToggle.isCompleted, userId);
      console.log(
        `HomeScreen.handleToggleComplete: setLocalTaskCompletion para ${taskId} retornou: ${localUpdateSuccess}`,
      );
      syncLocalTasksWithApi(true);
    }
  };

  if (isLoading && !initialLoadDone && tasks.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
  if (!idToken && !isLoading) {
    return (
      <View style={styles.outerContainer}>
        <Header />
        <View style={styles.contentArea}>
          <View style={styles.loadingContainer}>
            <Text>Por favor, faça login para ver suas tarefas.</Text>
          </View>
        </View>
      </View>
    );
  }

  const hasTasks = tasks.length > 0;

  return (
    <View style={styles.outerContainer}>
      <Header />
      {isSyncing && (
        <ActivityIndicator style={styles.syncIndicator} size="small" color={theme.colors.primary} />
      )}
      <View style={styles.contentArea}>
        {!hasTasks && userId && !isLoading ? (
          <View style={styles.emptyStateWrapper}>
            <EmptyStateComponent />
            <Pressable
              onPress={openCreateModal}
              style={[styles.createButton, styles.createButtonEmpty]}>
              <Text style={styles.createButtonText}>Criar Tarefa</Text>
            </Pressable>
          </View>
        ) : hasTasks && userId ? (
          <FlatList
            data={tasks}
            renderItem={({item}) => (
              <TaskItem
                task={item}
                onPress={() => handleTaskPress(item.id)}
                onToggleComplete={() => handleToggleComplete(item.id)}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContentContainer}
            refreshing={isSyncing}
            onRefresh={() => syncLocalTasksWithApi(true)}
          />
        ) : (
          <View style={styles.loadingContainer}>
            {isLoading && <ActivityIndicator size="large" color={theme.colors.primary} />}
            {!isLoading && !idToken && <Text>Por favor, faça login para ver suas tarefas.</Text>}
          </View>
        )}
      </View>

      {userId && (
        <View style={styles.bottomButtonContainer}>
          {hasTasks && (
            <Pressable onPress={openCreateModal} style={styles.createButton}>
              <Text style={styles.createButtonText}>Criar Tarefa</Text>
            </Pressable>
          )}
          <LogoutButton />
        </View>
      )}

      <CreateTaskModal
        isVisible={isModalVisible}
        onClose={closeCreateModal}
        onSave={handleTaskSaved}
      />
    </View>
  );
};

export default HomeScreen;
