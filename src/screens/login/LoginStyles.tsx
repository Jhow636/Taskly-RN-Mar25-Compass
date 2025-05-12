import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';

export const useLoginStyles = () => {
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
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        },
        logo: {
          height: 56,
          marginBottom: 40,
          resizeMode: 'contain',
        },
        label: {
          ...theme.typography.caption,
          color: theme.colors.mainText,
          alignSelf: 'flex-start',
          marginBottom: 5,
        },
        input: {
          width: '100%',
          height: 50,
          backgroundColor: theme.colors.secondaryBg,
          borderRadius: 8,
          paddingHorizontal: 15,
          marginBottom: 5,
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
          marginBottom: 12,
          height: 15,
        },
        checkboxContainer: {
          alignItems: 'center',
          alignSelf: 'flex-start',
          marginVertical: 15,
        },
        checkbox: {
          borderRadius: 2,
        },
        checkboxLabel: {
          ...theme.typography.regular,
          color: theme.colors.mainText,
          marginLeft: 8,
        },
        buttonPrimary: {
          width: '100%',
          backgroundColor: theme.colors.primary,
          paddingVertical: 10,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 20,
          marginBottom: 15,
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
        buttonDisabled: {
          opacity: 0.6,
        },

        // Estilos para o Modal
        centeredView: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
        modalView: {
          width: '85%',
          backgroundColor: '#FFFFFF',
          borderRadius: 10,
          padding: 16,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 4,
          elevation: 5,
        },
        modalTitle: {
          ...theme.typography.mediumTitle,
          fontSize: 16,
          color: '#000000',
          marginBottom: 4,
          textAlign: 'left',
        },
        modalMessage: {
          ...theme.typography.regular,
          fontSize: 14,
          color: '#333333',
          marginBottom: 12,
          textAlign: 'left',
        },
        modalButton: {
          width: '100%',
          height: 37,
          backgroundColor: 'transparent',
          borderRadius: 5,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#724CED',
        },
        modalButtonText: {
          ...theme.typography.mediumTitle,
          color: '#724CED',
          fontSize: 14,
          textTransform: 'uppercase',
        },
      }),
    [theme],
  );

  return styles;
};
