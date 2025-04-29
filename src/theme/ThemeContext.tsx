import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme } from './Theme';
import { DefaultTheme } from './DefaultTheme';
import { DarkTheme } from './DarkTheme';
import { getThemePreference, saveThemePreference } from '../storage/themeStorage';

// Define a forma do objeto que o Context irá fornecer
interface ThemeContextProps {
    theme: Theme;
    setAppTheme: (themeType: 'light' | 'dark') => void;
}

/*
    Cria o Context
    O valor padrão aqui é um objeto com DefaultTheme e uma função setAppTheme vazia.
    Este valor só será usado se o hook for chamado fora do Provider.
*/
const ThemeContext = createContext<ThemeContextProps>({
    theme: DefaultTheme,
    setAppTheme: () => {},
});

// Cria o Provider do Context
interface ThemeProviderProps {
    children: ReactNode; // Representa os componentes filhos que terão acesso ao Context
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    // State para armazenar o tema atual
    const [currentTheme, setCurrentTheme] = useState<Theme>(DefaultTheme);

    // Efeito que roda uma vez ao montar o Provider para carregar a preferência salva no MMKV
    useEffect(() => {
        const savedThemePreference = getThemePreference();
        if (savedThemePreference === 'dark') {
            setCurrentTheme(DarkTheme);
        } else {
            setCurrentTheme(DefaultTheme);
        }
}, []); // O array vazio garante que este efeito roda apenas na montagem

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

// Hook customizado para usar o Context de forma mais fácil
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
