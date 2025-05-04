import React, {useState} from 'react';
import {View, Text, FlatList, TextInput, Pressable} from 'react-native';
import {Subtask} from '../../data/models/Task';
import {useTaskDetailStyles} from '../../screens/tasks/TaskDetailStyles';
import SubtaskItem from './SubtaskItem';
import {useTheme} from '../../theme/ThemeContext';

interface SubtaskListSectionProps {
  subtasks: Subtask[];
  onAddSubtask: (text: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
}

const SubtaskListSection = ({
  subtasks,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}: SubtaskListSectionProps) => {
  const styles = useTaskDetailStyles();
  const {theme} = useTheme();
  const [newSubtaskText, setNewSubtaskText] = useState('');

  const handleAdd = () => {
    if (newSubtaskText.trim()) {
      onAddSubtask(newSubtaskText.trim());
      setNewSubtaskText('');
    }
  };

  return (
    <View style={styles.subtasksSection}>
      <Text style={styles.sectionTitle}>Subtarefas</Text>
      {subtasks.length > 0 ? (
        <FlatList
          data={subtasks}
          renderItem={({item}) => (
            <SubtaskItem
              subtask={item}
              onToggleComplete={() => onToggleSubtask(item.id)}
              onDelete={() => onDeleteSubtask(item.id)}
            />
          )}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noSubtasksText}>Nenhuma subtarefa adicionada</Text>
      )}

      {/* Input e Botão para Adicionar Subtarefa */}
      <View style={styles.addSubtaskContainer}>
        <TextInput
          style={styles.subtaskInput}
          placeholder="Nova subtarefa..."
          value={newSubtaskText}
          placeholderTextColor={theme.colors.secondaryText}
        />
        <Pressable
          onPress={handleAdd}
          style={[styles.button, styles.addSubtaskButton]}
          disabled={!newSubtaskText.trim()}>
          <Text style={styles.buttonText}>ADICIONAR</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default SubtaskListSection;
