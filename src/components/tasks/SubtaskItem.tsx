import React, {useState, useRef} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {AdvancedCheckbox} from 'react-native-advanced-checkbox';
import {Subtask} from '../../data/models/Task';
import {useTaskDetailStyles} from '../../screens/tasks/TaskDetailStyles';
import Icon from '@react-native-vector-icons/feather';
import AddItemInput from '../inputs/AddItemInput';
import {faCheckCircle, faEdit} from '@fortawesome/free-solid-svg-icons';
import {useTheme} from '../../theme/ThemeContext';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggleComplete: () => void;
  onDelete: () => void;
  onEditTextConfirm: (subtaskId: string, newText: string) => void;
}

const SubtaskItem = ({
  subtask,
  onToggleComplete,
  onDelete,
  onEditTextConfirm,
}: SubtaskItemProps) => {
  const styles = useTaskDetailStyles();
  const {theme} = useTheme();
  const swipeableRef = useRef<Swipeable>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(subtask.text);

  const handleEditPress = () => {
    setEditText(subtask.text);
    setIsEditing(true);
  };

  const handleEditConfirm = () => {
    if (!editText.trim()) {
      Alert.alert('Texto inválido', 'O texto da subtarefa não pode ser vazio.');
      return;
    }
    onEditTextConfirm(subtask.id, editText.trim());
    setIsEditing(false);
  };

  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete();
        }}>
        <Icon name="trash" size={24} color={theme.colors.mainText} />
      </TouchableOpacity>
    );
  };

  if (isEditing) {
    return (
      <View style={[styles.subtaskItem, styles.subtaskItemEditing]}>
        <View style={{flex: 1}}>
          <AddItemInput
            inputValue={editText}
            onInputChange={setEditText}
            onAddItem={handleEditConfirm}
            placeholder="Editar subtarefa..."
            buttonIcon={faCheckCircle}
            iconSize={20}
          />
        </View>
      </View>
    );
  }

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <View style={styles.subtaskItem}>
        <AdvancedCheckbox
          value={subtask.isCompleted}
          onValueChange={onToggleComplete}
          checkedImage={require('../../assets/img/checkbox-checked.png')}
          checkedColor="#32C25B"
          uncheckedColor="#B58B46"
          checkBoxStyle={styles.subtaskCheckbox}
          size={20}
        />
        <Text style={[styles.subtaskText, subtask.isCompleted && styles.subtaskTextCompleted]}>
          {subtask.text}
        </Text>
        <TouchableOpacity onPress={handleEditPress} style={styles.subtaskEditIcon}>
          <FontAwesomeIcon icon={faEdit} size={18} color={theme.colors.secondaryText} />
        </TouchableOpacity>
      </View>
    </Swipeable>
  );
};

export default SubtaskItem;
