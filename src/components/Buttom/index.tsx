import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './Buttom.style';

interface BottomProps {
    label: string;
}

const Bottom: React.FC<BottomProps> = ({label}) => {
    return (
        <TouchableOpacity
            style={styles.button}
            >
            <Text style={styles.btnText}>Criar Tarefa</Text>
        </TouchableOpacity>
    );
};

export default Bottom;