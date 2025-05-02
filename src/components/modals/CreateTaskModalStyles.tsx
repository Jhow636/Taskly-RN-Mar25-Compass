import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

export const useCreateTaskModalStyles = () => {
    const { theme } = useTheme();

    return useMemo(() => StyleSheet.create({
        keyboardAvoidingView: {
            flex: 1,
        },
        modalOverlay: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(17, 24, 39, 0.7)',
        },
        scrollContainer: {
            flexGrow: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            padding: 30,
        },
        modalContent: {
            backgroundColor: theme.colors.secondaryBg,
            borderRadius: 12,
            padding: 24,
            alignItems: 'stretch',
        },
        modalTitle: {
            ...theme.typography.subtitle,
            color: theme.colors.mainText,
            marginBottom: 12,
        },
        label: {
            ...theme.typography.caption,
            color: theme.colors.mainText,
            marginBottom: 7,
            alignSelf: 'flex-start',
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
        textArea: {
            height: 100, // Altura maior para descrição
            textAlignVertical: 'top', // Alinha texto no topo para multiline
        },
        errorText: {
            ...theme.typography.caption,
            color: theme.colors.error,
            alignSelf: 'flex-start',
            marginLeft: 5,
            marginBottom: 12, // Espaço depois da mensagem de erro
            height: 15, // Reserva o espaço mesmo sem erro
        },
        dateInputButton: {
            justifyContent: 'center',
        },
        dateInputText: {
            ...theme.typography.regular,
            color: theme.colors.mainText,
        },
        datePlaceholder: {
            color: theme.colors.secondaryText,
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
    }), [theme]);
};
