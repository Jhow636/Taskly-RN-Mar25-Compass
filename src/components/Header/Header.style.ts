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
          marginTop: 30,
          padding: 30,
          backgroundColor: theme.colors.background,
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
