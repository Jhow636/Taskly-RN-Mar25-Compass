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
import EmptyStateComponent from '../../components/EmptyState.tsx';
import {generateUniqueId} from '../../utils/idGenerator';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faFilter} from '@fortawesome/free-solid-svg-icons/faFilter';

// Helper para mapear prioridade local para valor da API
const mapPriorityToApiValue = (priority: Priority): 1 | 2 | 3 => {
  switch (priority) {
    case 'ALTA':
      return 1;
    case 'MÉDIA':
      return 2;
    case 'BAIXA':
      return 3;
    default:
      console.warn(`Prioridade desconhecida: ${priority}, usando padrão 2 (MÉDIA)`);
      return 2;
  }
};

// Helper para mapear prioridade da API (numérica) para local (string)
const mapApiPriorityToLocal = (apiPriority: number | string | undefined): Priority => {
  const priorityNum = typeof apiPriority === 'string' ? parseInt(apiPriority, 10) : apiPriority;
  switch (priorityNum) {
    case 1:
      return 'ALTA';
    case 2:
      return 'MÉDIA';
    case 3:
      return 'BAIXA';
    default:
      // Se a API retornar algo inesperado ou undefined, usar um padrão local
      console.warn(
        `Prioridade da API desconhecida ou ausente: ${apiPriority}, usando padrão MÉDIA`,
      );
      return 'MÉDIA';
  }
};

// Helper para formatar data ISO para dd/mm/yyyy
const formatDateToDdMmYyyy = (isoDateString: string): string => {
  if (!isoDateString) {
    return '';
  }
  try {
    const date = new Date(isoDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    console.error('Erro ao formatar data para dd/mm/yyyy:', isoDateString, e);
    return '';
  }
};

// Helper para converter "dd/mm/yyyy" para string ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
const parseDdMmYyyyToISO = (dateString: string | undefined): string => {
  if (!dateString || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
    // Se a string estiver vazia, undefined, inválida ou não no formato esperado,
    // retorna uma string vazia. O componente de data/lógica local deve lidar com isso.
    if (dateString) {
      // Loga apenas se não for undefined/null/vazio para evitar spam
      console.warn(
        `Data da API inválida ou vazia para conversão para ISO: '${dateString}'. Retornando string vazia.`,
      );
    }
    return '';
  }
  try {
    const parts = dateString.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Mês é 0-indexado em JavaScript Date
    const year = parseInt(parts[2], 10);
    // Cria a data em UTC para evitar problemas de fuso horário ao converter para ISO string
    const date = new Date(Date.UTC(year, month, day));
    if (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month &&
      date.getUTCDate() === day
    ) {
      return date.toISOString();
    } else {
      console.error(
        `Falha ao parsear data "dd/mm/yyyy" para ISO: ${dateString} resultou em data inválida.`,
      );
      return '';
    }
  } catch (e) {
    console.error(`Erro ao parsear data "dd/mm/yyyy" para ISO: ${dateString}`, e);
    return '';
  }
};

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

  useEffect(() => {
    // Extrai todas as tags únicas das tarefas atuais
    const tagsSet = new Set<string>();
    tasks.forEach(task => {
      (task.tags || []).forEach(tag => tagsSet.add(tag));
    });
    setAvailableTags(Array.from(tagsSet));
  }, [tasks]);

  const applyFilters = useCallback(
    (filters: FilterOptions, taskList = tasks): void => {
      let filteredTasks = [...taskList];

      // Filtro por tags
      if (filters.tags && filters.tags.length > 0) {
        filteredTasks = filteredTasks.filter(task =>
          task.tags.some(tag => filters.tags.includes(tag)),
        );
      }

      // Filtro por data
      if (filters.date) {
        filteredTasks = filteredTasks.filter(task => {
          const taskDate = formatDateToDdMmYyyy(task.dueDate);
          return taskDate === filters.date;
        });
      }

      // Ordenação por prioridade
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
      const prepareTaskPayloadForApi = (
        task: TaskModel,
        isShellForStatusUpdateOnly: boolean = false,
      ) => {
        if (isShellForStatusUpdateOnly) {
          return {
            done: task.isCompleted,
          };
        }

        const deadlineFormatted = formatDateToDdMmYyyy(task.dueDate);

        const payload: any = {
          title: task.title,
          description: task.description,
          done: task.isCompleted,
          priority: mapPriorityToApiValue(task.priority),
          subtasks: task.subtasks.map(st => ({title: st.text, done: st.isCompleted})),
          tags: task.tags,
        };

        if (deadlineFormatted) {
          payload.deadline = deadlineFormatted;
        } else if (task._isNewForApi) {
          console.error(
            `CRÍTICO: Tentando criar nova tarefa (POST) com deadline formatado vazio para task.dueDate: ${task.dueDate}. Task ID local: ${task.id}. Verifique a lógica do CreateTaskModal.`,
          );
        }
        return payload;
      };

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

        if (userId) {
          for (const apiTask of formattedApiTasks) {
            const localTask = getAllLocalTasks(userId).find(t => t.id === apiTask.id);

            // Se a task local tem alterações pendentes, NÃO sobrescreva!
            if (localTask && localTask.needsSync) {
              continue;
            }

            // Merge de subtarefas: preserva IDs locais se o texto for igual
            const mergedSubtasks = (apiTask.subtasks || []).map(apiSub => {
              const localSub = localTask?.subtasks?.find(ls => ls.text === apiSub.text);
              return {
                ...apiSub,
                id: localSub ? localSub.id : apiSub.id || generateUniqueId(),
              };
            });

            saveTaskFromApi(
              {
                ...apiTask,
                subtasks: mergedSubtasks,
              },
              userId,
            );
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

  const handleTaskPress = (task: TaskModel) => {
    navigation.navigate('TaskDetails', {task});
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
  const hasFilters = !!activeFilters && (activeFilters.tags?.length > 0 || true);

  return (
    <View style={styles.outerContainer}>
      <Header />
      {/* Botão de filtro no topo */}
      <Pressable
        style={styles.topFilterButton}
        onPress={openFilterModal}
        accessibilityLabel="Abrir filtros"
        hitSlop={10}>
        <FontAwesomeIcon icon={faFilter} size={22} color={'#B58B46'} />
      </Pressable>
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
          <FlatList
            data={displayedTasks}
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
