import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';

export const useLogoutButtonStyles = () => {
  const {theme} = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        button: {
          backgroundColor: theme.colors.error,
          paddingVertical: 4,
          paddingHorizontal: 8,
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: 10,
        },
        buttonPressed: {
          opacity: 0.8,
        },
        buttonDisabled: {
          opacity: 0.6,
          backgroundColor: theme.colors.secondaryText,
        },
      }),
    [theme],
  );
};
