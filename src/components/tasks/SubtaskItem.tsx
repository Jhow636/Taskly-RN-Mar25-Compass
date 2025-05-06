import React from 'react';
import {View, Text, TouchableOpacity, Image} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import {AdvancedCheckbox} from 'react-native-advanced-checkbox';
import {Subtask} from '../../data/models/Task';
import {useTaskDetailStyles} from '../../screens/tasks/TaskDetailStyles';

interface SubtaskItemProps {
  subtask: Subtask;
  onToggleComplete: () => void;
  onDelete: () => void;
  // onEdit?: () => void; // Para edição futura
}

const SubtaskItem = ({subtask, onToggleComplete, onDelete}: SubtaskItemProps) => {
  const styles = useTaskDetailStyles();
  const swipeableRef = React.useRef<Swipeable>(null);

  const renderRightActions = () => {
    return (
      <TouchableOpacity
        style={styles.deleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onDelete();
        }}>
        <Image source={require('../../assets/img/delete-icon.png')} style={styles.icon} />
      </TouchableOpacity>
    );
  };

  return (
    <Swipeable ref={swipeableRef} renderRightActions={renderRightActions} overshootRight={false}>
      <View style={styles.subtaskItem}>
        <AdvancedCheckbox
          value={subtask.isCompleted}
          onValueChange={onToggleComplete}
          checkedColor="#32C25B"
          uncheckedColor="#B58B46"
          checkBoxStyle={styles.subtaskCheckbox}
          size={20}
        />
        <Text style={[styles.subtaskText, subtask.isCompleted && styles.subtaskTextCompleted]}>
          {subtask.text}
        </Text>
        {/* Ícone de Editar (para futuro) */}
        {/* <TouchableOpacity onPress={onEdit} style={styles.subtaskEditIcon}>
            <Image source={require('../../assets/img/edit-icon.png')} style={styles.icon} />
        </TouchableOpacity> */}
      </View>
    </Swipeable>
  );
};

export default SubtaskItem;
