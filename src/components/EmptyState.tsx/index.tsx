import React from 'react';
import {View, Text, Image} from 'react-native';
import {styles} from './EmptyState.style';

const EmptyState: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.containerImage}>
        <Image source={require('../../assets/imgs/sadEmoji.png')} style={styles.sadEmoji} />
      </View>
      <Text style={styles.textEmptyTasks}>No momento você não possui tarefa</Text>
    </View>
  );
};

export default EmptyState;
