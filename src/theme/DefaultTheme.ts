import { Theme } from './Theme';

export const DefaultTheme: Theme = {
    dark: false,
    colors: {
        primary: '#5B3CC4',
        primaryLight: '#E6E0F7',
        secondaryAccent: '#32C25B',
        background: '#F4F4F4',
        mainText: '#1E1E1E',
        secondaryText: '#7D7D7D',
        error: '#E63946',
        secondaryBg: '#FFFFFF',
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
