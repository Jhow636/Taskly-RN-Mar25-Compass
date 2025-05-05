import {StyleSheet} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';
import {useMemo} from 'react';

export const useHomeStyles = () => {
  const {theme} = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
        listContentContainer: {
          // Padding para a FlatList
          padding: 16,
          paddingBottom: 80, // Espaço para o botão flutuante
        },
        // Estilos para o Item da Tarefa (TaskItem)
        taskItem: {
          backgroundColor: theme.colors.secondaryBg,
          borderRadius: 8,
          marginBottom: 16,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 4, // For Android
          width: '100%',
          alignItems: 'stretch',
        },
        taskContent: {
          flex: 1,
        },
        taskHeader: {
          // Container para título e checkbox
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start', // Alinha no topo para títulos longos
          marginBottom: 8,
        },
        taskTitle: {
          ...theme.typography.subtitle,
          color: theme.colors.mainText,
          marginBottom: 4,
          flex: 1, // Permite que o título cresça
          marginRight: 10, // Espaço antes do checkbox
        },
        taskDescription: {
          ...theme.typography.regular,
          color: theme.colors.secondaryText,
          marginTop: -10,
          marginBottom: 12, // Espaço antes das tags/botão
        },
        taskCheckbox: {
          borderRadius: 50,
          borderWidth: 2,
        },
        tagsListContainer: {
          paddingBottom: 12,
        },
        tag: {
          backgroundColor: theme.colors.primaryLight,
          borderRadius: 8,
          paddingVertical: 4,
          paddingHorizontal: 12,
          marginRight: 12,
          alignSelf: 'flex-start',
        },
        tagText: {
          ...theme.typography.caption,
          color: theme.colors.mainText,
        },
        // Estilos para o botão "VER DETALHES"
        detailsButton: {
          backgroundColor: theme.colors.primary,
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 8,
          alignItems: 'center',
          alignSelf: 'center',
          marginTop: 8, // Espaço acima do botão se não houver tags
        },
        detailsButtonText: {
          ...theme.typography.regular,
          color: theme.colors.primaryLight,
          textTransform: 'uppercase',
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
      }),
    [theme],
  );
  return styles;
};
