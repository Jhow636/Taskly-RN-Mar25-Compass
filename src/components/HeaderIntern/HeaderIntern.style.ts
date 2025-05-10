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
          padding: 12,
          justifyContent: 'center',
          alignItems: 'center',
          color: theme.colors.mainText,
        },
        titleText: {
          ...theme.typography.bigTitle,
          textAlign: 'center',
          color: theme.colors.mainText,
        },
        profileImage: {
          width: 50,
          height: 50,
        },
      }),
    [theme],
  );
};
