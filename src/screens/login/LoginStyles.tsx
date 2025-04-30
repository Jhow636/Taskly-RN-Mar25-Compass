import { StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { useMemo } from 'react';

export const useLoginStyles = () => {
    const { theme } = useTheme();

    const styles = useMemo(() => StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30, // Aumentar padding
            backgroundColor: theme.colors.background,
        },
        logo: {
            width: '100%',
            height: 56,
            marginBottom: 24,
        },
        label: {
            ...theme.typography.caption,
            color: theme.colors.mainText,
            alignSelf: 'flex-start',
            marginBottom: 5,
            marginLeft: 10, // Pequeno espaço à esquerda
        },
        input: {
            width: '100%',
            height: 50,
            backgroundColor: theme.colors.secondaryBg,
            borderRadius: 8,
            paddingHorizontal: 15,
            marginBottom: 5, // Espaço antes da mensagem de erro
            ...theme.typography.regular,
            color: theme.colors.mainText,
            borderWidth: 2,
            borderColor: theme.colors.primary,
        },
        errorText: {
            ...theme.typography.caption,
            color: theme.colors.error,
            alignSelf: 'flex-start',
            marginLeft: 5,
            marginBottom: 12, // Espaço depois da mensagem de erro
            height: 15, // Reserva o espaço mesmo sem erro
        },
        buttonPrimary: {
            width: '100%',
            backgroundColor: theme.colors.primary,
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            marginTop: 20, // Espaço acima do botão primário
            marginBottom: 15, // Espaço entre botões
        },
        buttonSecondary: {
            width: '100%',
            backgroundColor: 'transparent',
            paddingVertical: 10,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.colors.primary,
        },
        buttonPrimaryText: {
            ...theme.typography.mediumTitle,
            color: theme.colors.secondaryBg,
            textTransform: 'uppercase',
        },
        buttonSecondaryText: {
            ...theme.typography.mediumTitle,
            color: theme.colors.primary,
            textTransform: 'uppercase',
        },
    }), [theme]);

    return styles;
};
