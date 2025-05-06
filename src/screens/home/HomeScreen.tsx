import React, {useState, useCallback} from 'react';
import {View, Text, FlatList, Pressable, ActivityIndicator} from 'react-native';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {MainStackParamList} from '../../navigation/types';
import {Task} from '../../data/models/Task';
import {getAllTasks, setTaskCompletion} from '../../storage/taskStorage';
import {useHomeStyles} from './HomeStyles';
import {useTheme} from '../../theme/ThemeContext';
import CreateTaskModal from '../../components/modals/CreateTaskModal';
import {AdvancedCheckbox} from 'react-native-advanced-checkbox';
import Header from '../../components/Header';
import EmptyStateComponent from '../../components/EmptyState.tsx';

type HomeScreenNavigationProp = NativeStackNavigationProp<MainStackParamList, 'Home'>;

interface TaskItemProps {
  task: Task;
  onPress: () => void;
  onToggleComplete: () => void;
}

// TaskItem component remains the same
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

// --- HomeScreen ---
const HomeScreen = () => {
  const styles = useHomeStyles();
  const {theme} = useTheme();
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loadTasks = useCallback(() => {
    setIsLoading(true);
    try {
      const storedTasks = getAllTasks();
      setTasks(storedTasks);
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const openCreateModal = () => setIsModalVisible(true);
  const closeCreateModal = () => setIsModalVisible(false);

  const handleTaskSaved = () => {
    closeCreateModal();
    loadTasks();
  };

  useFocusEffect(
    useCallback(() => {
      loadTasks();
      return () => {};
    }, [loadTasks]),
  );

  const handleTaskPress = (taskId: string) => {
    navigation.navigate('TaskDetails', {taskId});
  };

  const handleToggleComplete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const success = setTaskCompletion(taskId, !task.isCompleted);
      if (success) {
        setTasks(prevTasks =>
          prevTasks.map(t =>
            t.id === taskId
              ? {
                  ...t,
                  isCompleted: !t.isCompleted,
                  subtasks: t.subtasks.map(sub => ({
                    ...sub,
                    isCompleted: !task.isCompleted ? true : sub.isCompleted,
                  })),
                }
              : t,
          ),
        );
      } else {
        console.error('Falha ao atualizar status da tarefa:', taskId);
      }
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const hasTasks = tasks.length > 0;

  return (
    <View style={styles.outerContainer}>
      <Header />
      <View style={styles.contentArea}>
        {!hasTasks ? (
          <View style={styles.emptyStateWrapper}>
            <EmptyStateComponent />
            <Pressable
              onPress={openCreateModal}
              style={[styles.createButton, styles.createButtonEmpty]}>
              <Text style={styles.createButtonText}>Criar Tarefa</Text>
            </Pressable>
          </View>
        ) : (
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
          />
        )}
      </View>

      <View style={styles.bottomButtonContainer}>
        {hasTasks && (
          <Pressable onPress={openCreateModal} style={styles.createButton}>
            <Text style={styles.createButtonText}>Criar Tarefa</Text>
          </Pressable>
        )}
      </View>

      <CreateTaskModal
        isVisible={isModalVisible}
        onClose={closeCreateModal}
        onSave={handleTaskSaved}
      />
    </View>
  );
};

export default HomeScreen;
