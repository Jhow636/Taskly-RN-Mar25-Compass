import React from 'react';
import { StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Theme } from '../../theme/Theme';

type MenuOptionProps = {
    title: string;
    action?: () => void;
};

const MenuOption = ({ title, action }: MenuOptionProps) => {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <TouchableOpacity style={styles.container} onPress={action}>
            <Text style={styles.text}>{title}</Text>
            <Image
                source={require('../../assets/imgs/menuArrow.png')}
                style={styles.icon}
            />
        </TouchableOpacity>
    );
};

const getStyles = (theme: Theme) =>
    StyleSheet.create({
        container: {
            backgroundColor: theme.colors.secondaryBg,
            width: 329,
            height: 72,
            borderRadius: 12,
            shadowColor: '#000000',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4.65,
            elevation: 6,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 24,
            marginBottom: 16,
        },
        icon: {
            width: 9.75,
            height: 17.25,
        },
        text: {
            ...theme.typography.subtitle,
            color:theme.colors.mainText,
        },
    });

export default MenuOption;