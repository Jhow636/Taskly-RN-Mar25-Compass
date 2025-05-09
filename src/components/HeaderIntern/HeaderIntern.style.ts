import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {useTheme} from '../../theme/ThemeContext';

export const useHeaderInternStyles = () => {
  const {theme} = useTheme();

  return useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 30,
          backgroundColor: theme.colors.background,
        },
        backButton: {
          backgroundColor: theme.colors.secondaryText,
          borderRadius: 12,
          height: 48,
          width: 48,
          justifyContent: 'center',
          alignItems: 'center',
        },
        icon: {
          height: 17,
          width: 8,
        },
        titleText: {
          ...theme.typography.bigTitle,
          textAlign: 'center',
        },
        profileImage: {
          width: 50,
          height: 50,
        },
      }),
    [theme],
  );
};
