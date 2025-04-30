import { Theme } from './Theme';

export const DarkTheme: Theme = {
  dark: true,
  colors: {
    primary: '#552DDC',
    primaryLight: '#A393D1',
    secondaryAccent: '#32C25B',
    background: '#282828',
    mainText: '#F0F0F0',
    secondaryText: '#D9D9D9',
    error: '#E63946',
    secondaryBg: '#1E1E1E',
  },
  typography: {
    bigTitle: {
      fontSize: 24,
      fontFamily: 'Roboto-Bold',
    },
    mediumTitle: {
      fontSize: 20,
      fontFamily: 'Roboto-SemiBold',
    },
    subtitle: {
      fontSize: 18,
      fontFamily: 'Roboto-Medium',
    },
    regular: {
      fontSize: 16,
      fontFamily: 'Roboto',
    },
    caption: {
      fontSize: 12,
      fontFamily: 'Roboto',
    },
  },
  statusBarStyle: 'light',
};
