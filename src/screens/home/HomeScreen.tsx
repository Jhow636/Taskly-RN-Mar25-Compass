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
  saveTaskFromApi,
  replaceLocalTaskWithApiTask,
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
  const {userId, idToken, registerSyncFunction} = useAuth();
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const syncLocalTasksWithApi = useCallback(
    async (isManualRefresh = false) => {
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

      if (!userId || !idToken) {
        setIsLoading(false);
        setTasks([]);
        return;
      }

      if (isSyncing && !isManualRefresh) {
        console.log('HomeScreen: Sync already in progress, manual refresh not forced. Skipping.');
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
        const isShellForStatusUpdate = localTask.createdAt === new Date(0).toISOString(); // Sua lógica para shell
        const payload = prepareTaskPayloadForApi(localTask, isShellForStatusUpdate);
        const isTrulyNewForApi = localTask._isNewForApi === true;

        try {
          if (localTask.isDeleted) {
            console.log(`Sync: Deleting task ${localTask.id} from API.`);
            await deleteApiTask(localTask.id);
            markTaskAsSyncedAndRemove(localTask.id, userId);
            localSyncOperations++;
          } else if (isTrulyNewForApi && !isShellForStatusUpdate) {
            console.log(
              `Sync: Creating new task "${localTask.title}" on API (identified by _isNewForApi).`,
            );
            // Assumindo que createApiTask retorna a tarefa criada pela API com o ID do servidor
            const createdTaskFromApi = await createApiTask(payload);
            if (createdTaskFromApi && createdTaskFromApi.id) {
              replaceLocalTaskWithApiTask(localTask.id, createdTaskFromApi, userId);
              console.log(
                `Sync: Replaced local task ${localTask.id} with API task ${createdTaskFromApi.id}`,
              );
            } else {
              console.error(
                'Sync: createApiTask did not return a valid task with an ID. Task remains local with _isNewForApi=true.',
              );
              // A tarefa localTask continua com _isNewForApi: true, needsSync: true
              // Não fazer nada aqui, ela será re-tentada na próxima sincronização.
            }
            localSyncOperations++;
          } else {
            // Atualizar tarefa existente ou shell
            console.log(
              `Sync: Updating task ${localTask.id} (Title: "${localTask.title}") on API. Is shell: ${isShellForStatusUpdate}. Is new flag: ${isTrulyNewForApi}`,
            );
            await updateApiTask(localTask.id, payload);
            // Marcar como sincronizada (needsSync: false, remover _isNewForApi)
            const taskAfterUpdate = {...localTask, needsSync: false};
            delete taskAfterUpdate._isNewForApi;
            saveTaskFromApi(taskAfterUpdate, userId);
            localSyncOperations++;
          }
        } catch (error) {
          console.error(
            `Sync: Failed to sync task ${localTask.id} (Title: ${localTask.title}):`,
            error,
          );
          if (error instanceof CustomApiError && error.status === 404 && !localTask.isDeleted) {
            if (isTrulyNewForApi) {
              // Se era uma nova tarefa e deu 404 (ex: createApiTask falhou e o erro não foi pego antes, ou uma lógica de fallback tentou PUT)
              // Não remova localmente. A tarefa continua como _isNewForApi: true, needsSync: true.
              console.warn(
                `Sync: API operation for new task ${localTask.id} resulted in 404. Task remains local. Error: ${error.message}`,
              );
            } else if (!isShellForStatusUpdate) {
              // Era um update para uma tarefa que deveria existir
              console.warn(
                `Sync: Update for existing task ${localTask.id} failed (404). Task likely deleted on server. Removing local.`,
              );
              markTaskAsSyncedAndRemove(localTask.id, userId);
            } else {
              // Era um shell
              console.warn(
                `Sync: Shell task ${localTask.id} not found (404). Removing local shell.`,
              );
              markTaskAsSyncedAndRemove(localTask.id, userId);
            }
          }
          // Para outros erros, a tarefa permanece com needsSync: true (e _isNewForApi: true se aplicável)
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

        if (userId) {
          for (const apiTask of formattedApiTasks) {
            saveTaskFromApi(apiTask, userId);
          }
          const updatedLocalTasks = getAllLocalTasks(userId);
          setTasks(updatedLocalTasks);
          console.log(
            `Sync: Fetched ${formattedApiTasks.length} tasks from API. Local storage updated. Displaying ${updatedLocalTasks.length} tasks.`,
          );
        } else {
          setTasks([]);
        }
      } catch (error) {
        console.error('Sync: Error fetching tasks from API:', error);
        Alert.alert('Erro de Rede', 'Não foi possível buscar suas tarefas. Verifique sua conexão.');
        if (userId) {
          const localFallbackTasks = getAllLocalTasks(userId);
          setTasks(localFallbackTasks);
          console.log(
            `Sync: API fetch failed. Displaying ${localFallbackTasks.length} local tasks as fallback.`,
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
    registerSyncFunction(() => syncLocalTasksWithApi(false));
  }, [registerSyncFunction, syncLocalTasksWithApi]);

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

  const handleTaskPress = (task: TaskModel) => {
    navigation.navigate('TaskDetails', {task});
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
      const localUpdateSuccess = setLocalTaskCompletion(taskId, taskToToggle.isCompleted, userId);
      console.log(
        `HomeScreen.handleToggleComplete: setLocalTaskCompletion para ${taskId} retornou: ${localUpdateSuccess}`,
      );
      if (localUpdateSuccess) {
        syncLocalTasksWithApi(true);
      }
    }
  };

  if (isLoading && !initialLoadDone && tasks.filter(t => !t.isDeleted).length === 0) {
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
            <Text style={styles.tagText}>Por favor, faça login para ver suas tarefas.</Text>
          </View>
        </View>
      </View>
    );
  }

  const activeTasks = tasks.filter(task => !task.isDeleted);
  const hasTasks = activeTasks.length > 0;

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
            data={activeTasks}
            renderItem={({item}) => (
              <TaskItem
                task={item}
                onPress={() => handleTaskPress(item)}
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
            {!isLoading && !idToken && (
              <Text style={styles.tagText}>Por favor, faça login para ver suas tarefas.</Text>
            )}
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
