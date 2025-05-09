import React from 'react';
import {View, Text, Pressable, FlatList, TouchableOpacity, Image} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {Task} from '../../data/models/Task';
import {useTaskDetailStyles} from '../../screens/tasks/TaskDetailStyles';
import Icon from '@react-native-vector-icons/feather';

interface TaskDetailCardProps {
  task: Task;
  onEdit: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
}

const TaskDetailCard = ({task, onEdit, onToggleComplete, onDelete}: TaskDetailCardProps) => {
  const styles = useTaskDetailStyles();

  // Função para renderizar ação de swipe para deletar a tarefa principal
  const renderTaskDeleteAction = () => (
    <TouchableOpacity style={styles.deleteAction} onPress={onDelete}>
      <Icon name="trash" size={30} color={styles.icon.tintColor} />
    </TouchableOpacity>
  );

  return (
    <Swipeable renderRightActions={renderTaskDeleteAction} overshootRight={false}>
      <View style={styles.taskCard}>
        {/* Cabeçalho do Card */}
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Titulo</Text>
          <TouchableOpacity onPress={onEdit}>
            <Image source={require('../../assets/img/editIcon.png')} style={styles.editIcon} />
          </TouchableOpacity>
        </View>

        {/* Título */}
        <Text style={[styles.value, styles.title]}>{task.title}</Text>

        {/* Descrição */}
        <Text style={styles.sectionTitle}>Descrição</Text>
        <Text style={styles.value}>{task.description}</Text>

        {/* Tags */}
        <Text style={styles.sectionTitle}>Tags</Text>
        {task.tags && task.tags.length > 0 ? (
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
            style={styles.tagsList}
          />
        ) : (
          <Text style={styles.value}>Nenhuma tag adicionada</Text>
        )}

        {/* Prioridade */}
        <Text style={styles.sectionTitle}>Prioridade</Text>
        <View style={[styles.priorityBadge, styles[`priority${task.priority}`]]}>
          <Text style={[styles.priorityText]}>{task.priority}</Text>
        </View>

        {/* Botão Resolver/Desmarcar */}
        <Pressable onPress={onToggleComplete} style={[styles.button, styles.resolveButton]}>
          <Text style={styles.resolveText}>
            {task.isCompleted ? 'MARCAR COMO NÃO CONCLUÍDA' : 'RESOLVER TAREFA'}
          </Text>
        </Pressable>
      </View>
    </Swipeable>
  );
};

export default TaskDetailCard;
