// filepath: src/screens/tasks/TaskDetailStyles.tsx
import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';
import {Priority} from '../../data/models/Task';

export const useTaskDetailStyles = () => {
  const {theme} = useTheme();

  return useMemo(() => {
    const getPriorityStyles = (priority: Priority) => {
      switch (priority) {
        case 'ALTA':
          return {backgroundColor: theme.colors.secondaryAccent};
        case 'BAIXA':
          return {
            backgroundColor: theme.colors.secondaryAccent,
          };
        case 'MÉDIA':
        default:
          return {
            backgroundColor: theme.colors.secondaryAccent,
          };
      }
    };

    return StyleSheet.create({
      root: {
        flex: 1,
      },
      container: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      scrollContent: {
        padding: 16,
        paddingBottom: 40,
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      },
      errorText: {
        ...theme.typography.regular,
        color: theme.colors.error,
        textAlign: 'center',
        marginTop: 20,
      },
      taskCard: {
        backgroundColor: theme.colors.secondaryBg,
        borderRadius: 12,
        padding: 16,
        width: '98%',
        alignSelf: 'center',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 4,
      },
      cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomColor: theme.colors.primaryLight,
      },
      sectionTitle: {
        ...theme.typography.mediumTitle,
        color: theme.colors.secondaryText,
      },
      title: {
        ...theme.typography.subtitle,
        color: theme.colors.mainText,
        marginBottom: 8,
        marginTop: -4,
      },
      editIcon: {
        tintColor: '#B58B46',
        width: 24,
        height: 24,
      },
      icon: {
        width: 24,
        height: 24,
        tintColor: theme.colors.mainText,
      },
      value: {
        ...theme.typography.regular,
        color: theme.colors.mainText,
        marginBottom: 8,
      },
      tagsList: {
        marginBottom: 8,
        marginTop: 4,
      },
      tag: {
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 8,
        paddingVertical: 4,
        paddingHorizontal: 12,
        marginRight: 8,
        alignSelf: 'flex-start',
      },
      tagText: {
        ...theme.typography.regular,
        color: theme.colors.mainText,
      },
      priorityBadge: {
        borderRadius: 6,
        paddingVertical: 4,
        paddingHorizontal: 10,
        alignSelf: 'flex-start',
        marginBottom: 16,
      },
      priorityALTA: getPriorityStyles('ALTA'),
      priorityMÉDIA: getPriorityStyles('MÉDIA'),
      priorityBAIXA: getPriorityStyles('BAIXA'),
      priorityText: {
        ...theme.typography.regular,
        textTransform: 'uppercase',
        color: theme.colors.secondaryBg,
      },
      button: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
      },
      buttonText: {
        ...theme.typography.regular,
        color: theme.colors.secondaryBg,
        textTransform: 'uppercase',
      },
      resolveButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: theme.colors.primary,
      },
      resolveText: {
        ...theme.typography.regular,
        color: theme.colors.primary,
        textTransform: 'uppercase',
      },
      subtasksSection: {
        marginTop: 24,
      },
      addNewSubtaskButtonText: {
        ...theme.typography.regular,
        color: theme.colors.secondaryBg,
        textTransform: 'uppercase',
        textAlign: 'center',
      },
      addSingleSubtaskInputSection: {
        marginTop: 16,
      },
      subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.secondaryBg,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 10,
      },
      subtaskItemEditing: {
        paddingVertical: 4,
      },
      subtaskCheckbox: {
        marginRight: 10,
        width: 20,
        borderRadius: 2,
      },
      subtaskText: {
        ...theme.typography.regular,
        color: theme.colors.mainText,
        flex: 1,
      },
      subtaskTextCompleted: {
        textDecorationLine: 'line-through',
        color: theme.colors.secondaryText,
        marginLeft: 10,
      },
      subtaskEditIcon: {
        marginLeft: 10,
        padding: 4,
      },
      addSubtaskContainer: {
        flexDirection: 'row',
        marginTop: 16,
        alignItems: 'center',
      },
      subtaskInput: {
        flex: 1,
        backgroundColor: theme.colors.secondaryBg,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
        ...theme.typography.regular,
        color: theme.colors.mainText,
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      addSubtaskButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: 6,
        width: '100%',
        borderRadius: 8,
        marginTop: 30,
      },
      // Estilo para o container dos múltiplos inputs de subtarefa
      addMultipleSubtasksSection: {
        // Renomeado de addSingleSubtaskInputSection ou novo
        marginTop: 10, // Espaço acima da lista de inputs pendentes
      },
      pendingSubtaskInputContainer: {
        // Container para cada linha de input pendente (input + botão de remover)
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12, // Espaço entre cada input pendente
      },
      addItemInputWrapper: {
        // Wrapper para o AddItemInput para permitir que ele ocupe espaço flexível
        flex: 1,
      },
      removePendingInputButton: {
        // Botão para remover um input pendente específico
        paddingLeft: 10, // Espaço à esquerda do ícone de remover
        paddingVertical: 12, // Para alinhar verticalmente com o botão interno do AddItemInput
      },

      // Botão principal para adicionar um novo campo de input
      addNewSubtaskButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderRadius: 8,
        marginTop: 16, // Espaçamento acima do botão, especialmente se houver inputs pendentes
      },
      addNewSubtaskButtonProminent: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
      },
      addNewSubtaskButtonTextProminent: {
        color: theme.colors.secondaryBg,
      },
      deleteAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
      },
    });
  }, [theme]);
};
