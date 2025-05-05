import React, {useState, useEffect} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '../theme/ThemeContext';
import {useLoginStyles} from '../screens/login/LoginStyles';

// Importar tipos de navegação
import {AuthStackParamList} from './types';

// Importar telas
import LoginScreen from '../screens/login/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
// import EditTaskScreen from '../screens/tasks/EditTaskScreen';
import NotificationsScreen from '../screens/Notifications';
import MenuScreen from '../screens/Menu';

// Importa componentes e ícones necessários para as Tabs
import Icon from '@react-native-vector-icons/feather';
import CircularIconButton from '../components/CircularIconButton';

// importa função de verificação de sessão ativa
import {getLoginSession} from '../storage/userStorage';

// --- Stacks ---
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator();

// --- Navegadores ---

// Navegador de Autenticação (Telas de Login, Registro, etc.)
function AuthNavigator() {
  const {theme} = useTheme();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: theme.statusBarStyle,
      }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      {/* <AuthStack.Screen name="Register" component={RegisterScreen} /> */}
    </AuthStack.Navigator>
  );
}

// Navegador Principal com Abas
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 80,
        },
        tabBarActiveTintColor: '#ffffff',
        tabBarInactiveTintColor: '#5B3CC4',
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused, color}) => {
            return focused ? (
              <CircularIconButton colorIcon={color} nameIcon="clipboard" />
            ) : (
              <Icon name="clipboard" size={20} color={color} />
            );
          },
          tabBarIconStyle: {
            marginTop: 20,
          },
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({color, focused}) => {
            return focused ? (
              <CircularIconButton colorIcon={color} nameIcon="bell" />
            ) : (
              <Icon name="bell" size={20} color={color} />
            );
          },
          tabBarIconStyle: {
            marginTop: 20,
          },
        }}
      />
      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          tabBarIcon: ({color, focused}) => {
            return focused ? (
              <CircularIconButton colorIcon={color} nameIcon="menu" />
            ) : (
              <Icon name="menu" size={20} color={color} />
            );
          },
          tabBarIconStyle: {
            marginTop: 20,
          },
        }}
      />
    </Tab.Navigator>
  );
}

// --- Navegador Raiz ---
const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const {theme} = useTheme();
  const styles = useLoginStyles();

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
      } finally {
        setIsLoading(false);
      }
    };
    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isUserLoggedIn ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator;
