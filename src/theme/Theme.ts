import { TextStyle } from 'react-native';

export interface Theme {
    dark: boolean;
    colors: {
        primary: string;
        primaryLight: string;
        secondaryAccent: string;
        background: string;
        mainText: string;
        secondaryText: string;
        error: string;
        secondaryBg: string;
    };
    typography: {
        bigTitle: TextStyle;
        mediumTitle: TextStyle;
        subtitle: TextStyle;
        regular: TextStyle;
        caption: TextStyle;
    };
}
