import React, {useState} from 'react';
import {View, Text, FlatList, TouchableOpacity, Alert} from 'react-native';
import {faCircleArrowRight} from '@fortawesome/free-solid-svg-icons';
import {Subtask} from '../../data/models/Task';
import {useTaskDetailStyles} from '../../screens/tasks/TaskDetailStyles';
import SubtaskItem from './SubtaskItem';
import AddItemInput from '../inputs/AddItemInput';
import {generateUniqueId} from '../../utils/idGenerator';

interface SubtaskListSectionProps {
  subtasks: Subtask[];
  onAddSubtaskConfirmed: (text: string) => void;
  onToggleSubtask: (subtaskId: string) => void;
  onDeleteSubtask: (subtaskId: string) => void;
  onUpdateSubtaskText: (subtaskId: string, newText: string) => void;
}

// Interface para os inputs pendentes
interface PendingSubtaskInput {
  tempId: string; // ID temporário para o input
  text: string;
}

const SubtaskListSection = ({
  subtasks,
  onAddSubtaskConfirmed,
  onToggleSubtask,
  onDeleteSubtask,
  onUpdateSubtaskText,
}: SubtaskListSectionProps) => {
  const styles = useTaskDetailStyles();

  const [pendingSubtaskInputs, setPendingSubtaskInputs] = useState<PendingSubtaskInput[]>([]);

  const handleAddNewPendingSubtaskInput = () => {
    // Adiciona um novo objeto de input ao array
    setPendingSubtaskInputs(prevInputs => [...prevInputs, {tempId: generateUniqueId(), text: ''}]);
  };

  const handlePendingSubtaskInputChange = (tempId: string, newText: string) => {
    setPendingSubtaskInputs(prevInputs =>
      prevInputs.map(input => (input.tempId === tempId ? {...input, text: newText} : input)),
    );
  };

  const handleRemovePendingSubtaskInput = (tempId: string) => {
    setPendingSubtaskInputs(prevInputs => prevInputs.filter(input => input.tempId !== tempId));
  };

  const handleConfirmAndAddSinglePendingSubtask = (tempId: string) => {
    const pendingInput = pendingSubtaskInputs.find(input => input.tempId === tempId);
    if (!pendingInput || !pendingInput.text.trim()) {
      Alert.alert('Subtarefa vazia', 'Por favor, digite o texto da subtarefa antes de confirmar.');
      return;
    }
    onAddSubtaskConfirmed(pendingInput.text.trim());
    // Remove o input da lista de pendentes após ser confirmado e adicionado
    handleRemovePendingSubtaskInput(tempId);
  };

  const hasSubtasks = subtasks && subtasks.length > 0;

  return (
    <View style={styles.subtasksSection}>
      {hasSubtasks && (
        <FlatList
          data={subtasks}
          renderItem={({item}) => (
            <SubtaskItem
              subtask={item}
              onToggleComplete={() => onToggleSubtask(item.id)}
              onDelete={() => onDeleteSubtask(item.id)}
              onEditTextConfirm={onUpdateSubtaskText}
            />
          )}
          keyExtractor={item => item.id}
          scrollEnabled={false}
        />
      )}

      <View style={styles.addMultipleSubtasksSection}>
        {pendingSubtaskInputs.map(pendingInput => (
          <View key={pendingInput.tempId} style={styles.pendingSubtaskInputContainer}>
            <View style={styles.addItemInputWrapper}>
              <AddItemInput
                inputValue={pendingInput.text}
                onInputChange={newText =>
                  handlePendingSubtaskInputChange(pendingInput.tempId, newText)
                }
                onAddItem={() => handleConfirmAndAddSinglePendingSubtask(pendingInput.tempId)}
                placeholder="Nova subtarefa..."
                buttonIcon={faCircleArrowRight}
                iconSize={22}
              />
            </View>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.addNewSubtaskButton, styles.addNewSubtaskButtonProminent]}
        onPress={handleAddNewPendingSubtaskInput} // Agora sempre adiciona um novo input
      >
        <Text style={[styles.addNewSubtaskButtonText, styles.addNewSubtaskButtonTextProminent]}>
          ADICIONAR SUBTASK
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default SubtaskListSection;
