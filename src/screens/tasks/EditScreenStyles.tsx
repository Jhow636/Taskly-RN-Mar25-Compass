import { useMemo } from 'react';
import { StyleSheet } from 'react-native'; // Ensure this is imported
import { Priority } from '../../data/models/Task';
import { useTheme } from '../../theme/ThemeContext'// Assuming useTheme is a custom hook

export const useEditTaskStyles = () => {
  const { theme } = useTheme();

  return useMemo(() => {
    const getPriorityStyles = (priority: Priority) => {
      switch (priority) {
        case 'ALTA':
          return {
            backgroundColor: theme.colors.secondaryAccent,
            color: theme.colors.secondaryBg,
            borderWidth: 0,
            justifyContent: 'center',
            alignItems: 'center',
          };
        case 'BAIXA':
          return {
            backgroundColor: theme.colors.secondaryAccent,
            color: theme.colors.secondaryBg,
            borderWidth: 0,
            justifyContent: 'center',
            alignItems: 'center',
          };
        case 'MÉDIA':
        default:
          return {
            backgroundColor: theme.colors.secondaryAccent,
            color: theme.colors.secondaryBg,
            borderWidth: 0,
            justifyContent: 'center',
            alignItems: 'center',
        };
      }
    };

    return StyleSheet.create({
      root: {
        flex: 1,
      },

      container: {
        flex: 1,
        padding: 30
      },
      containerChildren: {
        backgroundColor: theme.colors.secondaryBg,
        borderRadius: 12,
        padding: 24,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '100%'
      },
      outerContainer: {
        flex: 1,
      },
      label: {
        ...theme.typography.mediumTitle,
      fontSize: 18,
      marginBottom: 6,
      color: theme.colors.secondaryText,
    },
    input: {
        backgroundColor: theme.colors.secondaryBg, // Fundo um pouco diferente para destaque
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 7, // Espaço padrão abaixo do input
        ...theme.typography.regular,
        color: theme.colors.mainText,
        borderWidth: 2,
        borderColor: theme.colors.primary, // Borda sutil
    },
    scrollContent: {
        paddingBottom: 40,
      },
    multilineInput: {
      height: 100,
      textAlignVertical: 'top',
    },
    priorityContainer: {
      flexDirection: 'row',
      width: '100%',
      marginBottom: 12,
    },
    priorityButton: {
      paddingVertical: 2,
      paddingHorizontal: 12,
      borderRadius: 6,
      marginRight: 10,
      borderWidth: 2,
      borderColor: theme.colors.primary,
      width: '30%',
    },
    priorityALTA: getPriorityStyles('ALTA'),
    priorityMÉDIA: getPriorityStyles('MÉDIA'),
    priorityBAIXA: getPriorityStyles('BAIXA'),
    priorityText: {
      ...theme.typography.caption,
      color: theme.colors.primary,
      fontWeight: 'regular',
      textTransform: 'uppercase',
      textAlign: 'center',
      fontSize: 16
    },
    errorText: {
        ...theme.typography.caption,
        color: theme.colors.error,
        alignSelf: 'flex-start',
        marginLeft: 5,
        marginBottom: 12, // Espaço depois da mensagem de erro
        height: 15, // Reserva o espaço mesmo sem erro
      },
      label: {
        ...theme.typography.mediumTitle,
        color: theme.colors.secondaryText,
        marginTop: 12,
        marginBottom: 4,
        fontSize: 20
      },
      dateInputButton: {
        justifyContent: 'center',
      },
      dateInputText: {
        ...theme.typography.regular,
        color: theme.colors.mainText,
      },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
        width: '100%',
      },
      button: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        width: '48%',
        height: 45,
      },
      buttonText: {
        ...theme.typography.mediumTitle,
        textTransform: 'uppercase',
      },
      cancelButton: {
        backgroundColor: 'transparent', // Sem fundo
        borderWidth: 1,
        borderColor: theme.colors.primary,
      },
      cancelButtonText: {
        color: theme.colors.primary,
      },
      saveButton: {
        backgroundColor: theme.colors.primary,
      },
      saveButtonText: {
        color: theme.colors.secondaryBg, // Texto contrastante
      },
      deleteIcon: {
        color: theme.colors.error,
    },
    submitIcon: {
        color: theme.colors.secondaryAccent,
    },
    tagContainer :{
        flexDirection: 'row',
    },
    tagInputContainer : {
        width: '100%',
        position: 'relative'
    },
    tagChildrenContainer : {
        backgroundColor: theme.colors.primaryLight,
        borderRadius: 8,
        marginRight: 4,
        flexDirection: 'row',
        height: 27,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        marginBottom: 10
    },
    textTag : {
      ...theme.typography.regular,
      fontSize: 16,
      color: theme.colors.mainText
    },
    tagOuterContainer :{
      flexDirection: 'row',
      flexWrap: 'wrap'
    },
    buttonArrow :{
      position: 'absolute',
      right: 12,
      top: 16,

    }

    });
  }, [theme]);
};