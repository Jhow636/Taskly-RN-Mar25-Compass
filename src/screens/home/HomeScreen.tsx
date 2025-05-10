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
import {AdvancedCheckbox} from 'react-native-advanced-checkbox';
import Header from '../../components/Header';
import EmptyStateComponent from '../../components/EmptyState.tsx';
import {generateUniqueId} from '../../utils/idGenerator';

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

        const deadlineFormatted = formatDateToDdMmYyyy(task.dueDate); // task.dueDate deve ser ISO string

        // Começa com os campos que sempre são enviados ou têm defaults na API
        const payload: any = {
          title: task.title,
          description: task.description,
          done: task.isCompleted,
          priority: mapPriorityToApiValue(task.priority), // task.priority deve ser 'ALTA', 'MÉDIA', 'BAIXA'
          subtasks: task.subtasks.map(st => ({title: st.text, done: st.isCompleted})),
          tags: task.tags,
        };

        // Adicionar deadline ao payload apenas se for uma string formatada não vazia.
        // Isso evita enviar "deadline": "" para a API.
        if (deadlineFormatted) {
          payload.deadline = deadlineFormatted;
        } else if (task._isNewForApi) {
          // Se é uma nova tarefa (POST) e a data formatada é vazia,
          // isso indica um problema na lógica de criação/validação, pois deadline é obrigatório no POST.
          // O CreateTaskModal deve garantir que dueDate seja sempre uma data válida.
          console.error(
            `CRÍTICO: Tentando criar nova tarefa (POST) com deadline formatado vazio para task.dueDate: ${task.dueDate}. Task ID local: ${task.id}. Verifique a lógica do CreateTaskModal.`,
          );
          // Para evitar falha na API, podemos enviar uma data padrão, mas o ideal é corrigir a origem.
          // payload.deadline = formatDateToDdMmYyyy(new Date().toISOString()); // Exemplo de fallback
        }
        // Se não for uma nova tarefa (PUT) e deadlineFormatted for vazio, o campo deadline não será incluído no payload,
        // o que é o comportamento correto se a API trata campos ausentes como "não atualizar".

        return payload;
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
