import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from './Theme';
import { DefaultTheme } from './DefaultTheme';
import { DarkTheme } from './DarkTheme';
import { getThemePreference, saveThemePreference } from '../storage/themeStorage';

interface ThemeContextProps {
    theme: Theme;
    setAppTheme: (themeType: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextProps>({
    theme: DefaultTheme,
    setAppTheme: () => {},
});

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const [currentTheme, setCurrentTheme] = useState<Theme>(DefaultTheme);

    useEffect(() => {
        const savedThemePreference = getThemePreference();
        if (savedThemePreference === 'dark') {
            setCurrentTheme(DarkTheme);
        } else {
            setCurrentTheme(DefaultTheme);
        }
}, []);

    const setAppTheme = (themeType: 'light' | 'dark') => {
        if (themeType === 'dark') {
            setCurrentTheme(DarkTheme);
            saveThemePreference('dark');
        } else {
            setCurrentTheme(DefaultTheme);
            saveThemePreference('light');
        }
    };

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, setAppTheme}}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
