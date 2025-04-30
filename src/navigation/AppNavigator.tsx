import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';

// Importar tipos de navegação
import { AuthStackParamList, MainStackParamList } from './types';

// Importar telas
import LoginScreen from '../screens/login/LoginScreen';
// import RegisterScreen from '../screens/register/RegisterScreen'; // Descomente quando criar
// import HomeScreen from '../screens/home/HomeScreen'; // Descomente quando criar

// importa função de verificação de sessão ativa
import { getLoginSession } from '../storage/userStorage';

// --- Stacks ---
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

// --- Navegadores ---

// Navegador de Autenticação (Telas de Login, Registro, etc.)
function AuthNavigator() {
    const { theme } = useTheme();
    return (
        <AuthStack.Navigator screenOptions={{ headerShown: false, statusBarStyle: theme.statusBarStyle }}>
            <AuthStack.Screen name="Login" component={LoginScreen} />
            {/* <AuthStack.Screen name="Register" component={RegisterScreen} /> */}
        </AuthStack.Navigator>
    );
}

// Navegador Principal (Telas após o login)
function MainNavigator() {
    const { theme } = useTheme();
    return (
        <MainStack.Navigator screenOptions={{ headerShown: false, statusBarStyle: theme.statusBarStyle }}>
            <MainStack.Screen name="Home" component={HomeScreen} />
            {/* Adicione outras telas principais aqui */}
        </MainStack.Navigator>
    );
}

// --- Navegador Raiz ---
const AppNavigator = () => {
    const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

    useEffect(() => {
        const checkLoginStatus = () => {
            try {
                const loggedInUserEmail = getLoginSession();
                if (loggedInUserEmail) {
                    console.log(`Sessão encontrada para: ${loggedInUserEmail}`);
                    setIsUserLoggedIn(true);
                } else {
                    setIsUserLoggedIn(false);
                }
            } catch (error) {
                console.error('Erro ao verificar sessão de login:', error);
                setIsUserLoggedIn(false);
            }
        };
        checkLoginStatus();
    }, []);

    return (
        <NavigationContainer>
            {isUserLoggedIn ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}

export default AppNavigator;
