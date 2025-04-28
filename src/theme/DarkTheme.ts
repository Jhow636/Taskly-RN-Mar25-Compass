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
          fontWeight: 'bold',
        },
        mediumTitle: {
          fontSize: 20,
          fontWeight: 'semibold',
        },
        subtitle: {
            fontSize: 18,
            fontWeight: 'medium',
        },
        regular: {
          fontSize: 16,
          fontWeight: 'normal',
        },
        caption: {
            fontSize: 12,
            fontWeight: 'normal',
        },
    },
};
