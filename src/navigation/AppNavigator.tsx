import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';

// Importar tipos de navegação
import { AuthStackParamList, MainStackParamList } from './types';

// Importar telas
import LoginScreen from '../screens/login/LoginScreen';
// import RegisterScreen from '../screens/register/RegisterScreen'; // Descomente quando criar
// import HomeScreen from '../screens/home/HomeScreen'; // Descomente quando criar

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
    // TODO: Implementar lógica real de verificação de login
    //       (Ex: verificar um token/flag no MMKV)
    const isLoggedIn = false; // Placeholder - Mude isso com base no estado de login real

    return (
        <NavigationContainer>
            {isLoggedIn ? <MainNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}

export default AppNavigator;
