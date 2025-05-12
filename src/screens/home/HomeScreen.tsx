import React, {useState, useCallback, useEffect} from 'react';
import {View, Text, FlatList, Pressable, ActivityIndicator, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../navigation/types';
import {Task as TaskModel, Priority} from '../../data/models/Task';
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
import FilterModal, {FilterOptions} from '../../components/FilterModal';
import {AdvancedCheckbox} from 'react-native-advanced-checkbox';
import Header from '../../components/Header';
import EmptyStateComponent from '../../components/EmptyState.tsx/index';
import LogoutButton from '../../components/LogoutButton';
import {generateUniqueId} from '../../utils/idGenerator';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faFilter} from '@fortawesome/free-solid-svg-icons/faFilter';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

interface TaskItemProps {
  task: TaskModel;
  onPress: () => void;
  onToggleComplete: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({task, onPress, onToggleComplete}) => {
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

const HomeScreen: React.FC = () => {
  const styles = useHomeStyles();
  const {theme} = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {userId, idToken, registerSyncFunction} = useAuth();
  const [tasks, setTasks] = useState<TaskModel[]>([]);
  const [displayedTasks, setDisplayedTasks] = useState<TaskModel[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState<boolean>(false);
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions | null>(null);
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  const prepareTaskPayloadForApi = (task: TaskModel) => {
    return {
      title: task.title,
      description: task.description,
      done: task.isCompleted,
      subtasks: task.subtasks.map(st => ({title: st.text, done: st.isCompleted})),
      tags: task.tags,
    };
  };

  // Definindo applyFilters fora do useCallback para evitar dependência circular
  const applyFilters = useCallback(
    (filters: FilterOptions, taskList = tasks): void => {
      let filteredTasks = [...taskList];

      // Apply tag filters
      if (filters.tags && filters.tags.length > 0) {
        filteredTasks = filteredTasks.filter(task =>
          task.tags.some(tag => filters.tags.includes(tag)),
        );
      }

      // Apply priority sorting
      filteredTasks.sort((a, b) => {
        const priorityValues: {[key: string]: number} = {ALTA: 3, MÉDIA: 2, BAIXA: 1};
        const priorityA = priorityValues[a.priority] || 2;
        const priorityB = priorityValues[b.priority] || 2;

        if (filters.orderBy === 'high-to-low') {
          return priorityB - priorityA;
        } else {
          return priorityA - priorityB;
        }
      });

      setDisplayedTasks(filteredTasks);
      setActiveFilters(filters);
    },
    [tasks],
  );

  const syncLocalTasksWithApi = useCallback(
    async (isManualRefresh = false) => {
      if (!userId || !idToken) {
        setIsLoading(false);
        setTasks([]);
        setDisplayedTasks([]);
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
        const isShellForStatusUpdate = localTask.createdAt === new Date(0).toISOString();
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
            }
            localSyncOperations++;
          } else {
            console.log(
              `Sync: Updating task ${localTask.id} (Title: "${localTask.title}") on API. Is shell: ${isShellForStatusUpdate}. Is new flag: ${isTrulyNewForApi}`,
            );
            await updateApiTask(localTask.id, payload);
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
              console.warn(
                `Sync: API operation for new task ${localTask.id} resulted in 404. Task remains local. Error: ${error.message}`,
              );
            } else if (!isShellForStatusUpdate) {
              console.warn(
                `Sync: Update for existing task ${localTask.id} failed (404). Task likely deleted on server. Removing local.`,
              );
              markTaskAsSyncedAndRemove(localTask.id, userId);
            } else {
              console.warn(
                `Sync: Shell task ${localTask.id} not found (404). Removing local shell.`,
              );
              markTaskAsSyncedAndRemove(localTask.id, userId);
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
          isCompleted: apiTask.done, // 'done' da API para 'isCompleted' local
          createdAt: apiTask.createdAt || new Date().toISOString(),
          updatedAt: apiTask.updatedAt || new Date().toISOString(),
          // Mapear deadline da API ("dd/mm/yyyy") para dueDate local (ISO string)
          dueDate: parseDdMmYyyyToISO(apiTask.deadline),
          // Mapear priority da API (1,2,3) para priority local ('ALTA', 'MÉDIA', 'BAIXA')
          priority: mapApiPriorityToLocal(apiTask.priority),
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

        // Extract all available tags from tasks
        const allTags = new Set<string>();
        formattedApiTasks.forEach(task => {
          if (task.tags && task.tags.length > 0) {
            task.tags.forEach(tag => allTags.add(tag));
          }
        });
        setAvailableTags(Array.from(allTags));

        // Apply current filters if they exist
        if (activeFilters) {
          applyFilters(activeFilters, formattedApiTasks);
        } else {
          setDisplayedTasks(formattedApiTasks);
        }

        console.log(
          `Sync: Fetched ${formattedApiTasks.length} tasks from API. Displaying API tasks.`,
        );
      } catch (error) {
        console.error('Sync: Error fetching tasks from API:', error);
        Alert.alert('Erro de Rede', 'Não foi possível buscar suas tarefas. Verifique sua conexão.');
        if (!isManualRefresh) {
          const remainingLocalTasks = getAllLocalTasks(userId);
          setTasks(remainingLocalTasks);
          setDisplayedTasks(remainingLocalTasks);
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
    [userId, idToken, isSyncing, initialLoadDone, activeFilters, applyFilters],
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
      setDisplayedTasks([]);
      setIsLoading(false);
      setInitialLoadDone(false);
      console.log('HomeScreen: No token, clearing tasks and resetting initial load state.');
    }
  }, [userId, idToken, initialLoadDone, syncLocalTasksWithApi]);

  const openCreateModal = (): void => setIsModalVisible(true);
  const closeCreateModal = (): void => setIsModalVisible(false);

  const openFilterModal = (): void => setIsFilterModalVisible(true);
  const closeFilterModal = (): void => setIsFilterModalVisible(false);

  const clearFilters = (): void => {
    setActiveFilters(null);
    setDisplayedTasks(tasks);
  };

  const handleApplyFilters = (filters: FilterOptions): void => {
    applyFilters(filters);
  };

  const handleTaskSaved = (): void => {
    closeCreateModal();
    if (userId) {
      const currentLocalTasks = getAllLocalTasks(userId);
      setTasks(currentLocalTasks);

      // Apply current filters if they exist
      if (activeFilters) {
        applyFilters(activeFilters, currentLocalTasks);
      } else {
        setDisplayedTasks(currentLocalTasks);
      }

      syncLocalTasksWithApi(true);
    }
  };

  const handleTaskPress = (taskId: string): void => {
    navigation.navigate('TaskDetails', {taskId});
  };

  const handleToggleComplete = (taskId: string): void => {
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

      // Update displayed tasks as well
      const displayedIndex = displayedTasks.findIndex(t => t.id === taskId);
      if (displayedIndex > -1) {
        const updatedDisplayedTasks = [...displayedTasks];
        updatedDisplayedTasks[displayedIndex].isCompleted = taskToToggle.isCompleted;
        if (taskToToggle.isCompleted) {
          updatedDisplayedTasks[displayedIndex].subtasks.forEach(sub => (sub.isCompleted = true));
        }
        setDisplayedTasks(updatedDisplayedTasks);
      }

      setLocalTaskCompletion(taskId, taskToToggle.isCompleted, userId);
      syncLocalTasksWithApi(true);
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

  const hasTasks = displayedTasks.length > 0;
  const hasFilters = activeFilters && (activeFilters.tags.length > 0 || true);

  return (
    <View style={styles.outerContainer}>
      <Header />
      {isSyncing && (
        <ActivityIndicator style={styles.syncIndicator} size="small" color={theme.colors.primary} />
      )}

      {/* Active Filters Bar */}
      {hasFilters && (
        <View style={styles.activeFiltersContainer}>
          <Text style={styles.activeFiltersText}>
            {activeFilters?.tags.length ? `Tags: ${activeFilters.tags.join(', ')} • ` : ''}
            Ordenado por prioridade (
            {activeFilters?.orderBy === 'high-to-low' ? 'alta para baixa' : 'baixa para alta'})
          </Text>
          <Pressable onPress={clearFilters}>
            <Text style={styles.clearFiltersText}>Limpar</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.contentArea}>
        {!hasTasks && userId && !isLoading ? (
          activeFilters ? (
            <View style={styles.noFilteredTasksContainer}>
              <Text style={styles.noFilteredTasksText}>
                Nenhuma tarefa encontrada com os filtros selecionados.
              </Text>
              <Pressable style={styles.clearFiltersButton} onPress={clearFilters}>
                <Text style={styles.clearFiltersButtonText}>LIMPAR FILTROS</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyStateWrapper}>
              <EmptyStateComponent />
              <Pressable
                onPress={openCreateModal}
                style={[styles.createButton, styles.createButtonEmpty]}>
                <Text style={styles.createButtonText}>Criar Tarefa</Text>
              </Pressable>
            </View>
          )
        ) : hasTasks && userId ? (
          <>
            {/* Botão de filtro como na imagem 1 - apenas o ícone no canto esquerdo */}
            {tasks.length > 0 && (
              <Pressable style={styles.topFilterButton} onPress={openFilterModal}>
                <FontAwesomeIcon icon={faFilter} size={24} color="#B58B46" />
              </Pressable>
            )}

            <FlatList
              data={displayedTasks}
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
          </>
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
              <Text style={styles.createButtonText}>CRIAR TAREFA</Text>
            </Pressable>
          )}
        </View>
      )}

      <CreateTaskModal
        isVisible={isModalVisible}
        onClose={closeCreateModal}
        onSave={handleTaskSaved}
      />

      <FilterModal
        isVisible={isFilterModalVisible}
        onClose={closeFilterModal}
        onApplyFilters={handleApplyFilters}
        availableTags={availableTags}
      />
    </View>
  );
};

export default HomeScreen;
