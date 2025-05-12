import React from 'react';
import { View } from 'react-native';
import Icon from '@react-native-vector-icons/feather';
import { styles } from './CircularIconButton.style';


interface CircularIconButtonProps {
    colorIcon: string;
    nameIcon: string;
}

const CircularIconButton: React.FC<CircularIconButtonProps> = ({colorIcon, nameIcon}) => {
    return (
        <View style={styles.containerIconButton}>
            <Icon style={styles.icon} name={nameIcon} size={20} color={colorIcon} />
        </View>
    );
};

export default CircularIconButton;