import React from 'react';
import {TouchableOpacity, StyleSheet, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

interface BackButtonProps {
  onPress: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({onPress}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Ionicons name="chevron-back" size={22} color="#000" />
      <Text style={styles.text}>VOLTAR</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  text: {
    color: '#000000',
    fontWeight: '500',
    fontSize: 15,
    marginLeft: 4,
  },
});

export default BackButton;
