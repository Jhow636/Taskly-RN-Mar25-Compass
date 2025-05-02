import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useMemo } from 'react';

export const useHomeStyles = () => {
    const { theme } = useTheme();

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
            backgroundColor: theme.colors.background,
        },
        loadingContainer: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        listContentContainer: { // Padding para a FlatList
            padding: 16,
            paddingBottom: 80, // Espaço para o botão flutuante
        },
        // Estilos para o Item da Tarefa (TaskItem)
        taskItem: {
            backgroundColor: theme.colors.secondaryBg,
            padding: 15,
            borderRadius: 8,
            marginBottom: 12,
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
            width: '100%',
            alignItems: 'stretch',
        },
        taskInfo: {
            flex: 1,
            marginRight: 10,
        },
        taskTitle: {
            ...theme.typography.subtitle,
            color: theme.colors.mainText,
            marginBottom: 4,
        },
        taskDescription: {
            ...theme.typography.regular,
            color: theme.colors.secondaryText,
        },
        taskCheckbox: {
            borderRadius: 50,
        },
        // Estilos para o Empty State
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
        },
        emptyIcon: {
            width: 150,
            height: 150,
            marginBottom: 16,
            opacity: 0.5,
        },
        emptyText: {
            ...theme.typography.regular,
            color: theme.colors.secondaryText,
            textAlign: 'center',
        },
        // Estilos para Tags (dentro do TaskItem)
        tagsContainer: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 8,
        },
        tag: {
            backgroundColor: theme.colors.primaryLight,
            borderRadius: 4,
            paddingVertical: 3,
            paddingHorizontal: 8,
            marginRight: 6,
            marginBottom: 4,
        },
        tagText: {
            ...theme.typography.caption,
            color: theme.colors.primary,
            fontSize: 10, // Menor para tags
        },
        createButton: {
            width: '100%',
            backgroundColor: theme.colors.primary,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 20,
            marginBottom: 15,
        },
        createButtonText: {
            ...theme.typography.mediumTitle,
            color: theme.colors.secondaryBg,
        },
    }), [theme]);
    return styles;
};
