import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { styles } from './EmptyState.style';
import { FlatList } from 'react-native-gesture-handler';

interface EmptyStateProps {
    tasks: any[];
}

const tasks: any[] = []

const EmptyState: React.FC = () => {
    return (
        tasks.length === 0 ? (
            <View style={styles.container}>
                <View style={styles.containerImage}>
                    <Image 
                        source={require('../../assets/imgs/sadEmoji.png')}
                        style={styles.sadEmoji}
                    />
                </View>
                <Text style={styles.textEmptyTasks}>No momento você não possui tarefa</Text>
            </View>
        ) : (
            <View>
                <FlatList 
                    data={tasks}
                    renderItem={({ item }) => (
                        <View>
                            <Text>{item.title}</Text>
                        </View>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    />
            </View>
        )
    );
};

export default EmptyState;