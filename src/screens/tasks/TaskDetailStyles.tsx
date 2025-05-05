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
          return {backgroundColor: theme.colors.secondaryAccent, color: theme.colors.secondaryBg};
        case 'BAIXA':
          return {
            backgroundColor: theme.colors.secondaryAccent + '30',
            color: theme.colors.secondaryBg,
          };
        case 'MÉDIA':
        default:
          return {
            backgroundColor: theme.colors.secondaryAccent + '30',
            color: theme.colors.secondaryBg,
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
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
      cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.primaryLight,
        paddingBottom: 10,
      },
      sectionTitle: {
        ...theme.typography.subtitle,
        color: theme.colors.mainText,
        fontWeight: 'bold',
      },
      editIcon: {
        padding: 4,
      },
      icon: {
        width: 24,
        height: 24,
        tintColor: theme.colors.mainText,
      },
      label: {
        ...theme.typography.caption,
        color: theme.colors.secondaryText,
        marginTop: 12,
        marginBottom: 4,
      },
      value: {
        ...theme.typography.regular,
        color: theme.colors.mainText,
        marginBottom: 8,
      },
      tagsList: {
        marginBottom: 8,
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
        ...theme.typography.caption,
        color: theme.colors.primary,
        fontWeight: '600',
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
        ...theme.typography.caption,
        fontWeight: 'bold',
        textTransform: 'uppercase',
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
        marginTop: 16,
      },
      noSubtasksText: {
        ...theme.typography.regular,
        color: theme.colors.secondaryText,
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 16,
      },
      subtaskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.secondaryBg,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 2,
      },
      subtaskCheckbox: {
        marginRight: 12,
        borderRadius: 4,
      },
      subtaskText: {
        ...theme.typography.regular,
        color: theme.colors.mainText,
        flex: 1,
      },
      subtaskTextCompleted: {
        textDecorationLine: 'line-through',
        color: theme.colors.secondaryText,
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
      },
      deleteAction: {
        backgroundColor: theme.colors.error,
        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
      },
      deleteIcon: {
        width: 24,
        height: 24,
        tintColor: theme.colors.mainText,
      },
    });
  }, [theme]);
};
