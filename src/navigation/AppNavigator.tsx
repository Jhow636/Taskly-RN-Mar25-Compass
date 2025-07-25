import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useTheme} from '../theme/ThemeContext';
import {AuthStackParamList, MainStackParamList} from './types';
import LoginScreen from '../screens/login/LoginScreen';
import HomeScreen from '../screens/home/HomeScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import NotificationsScreen from '../screens/Notifications';

import Icon from '@react-native-vector-icons/feather';
import CircularIconButton from '../components/CircularIconButton';
import {useAuth} from '../context/AuthContext';
import SignupScreen from '../screens/SignupScreen';
import AvatarSelectionScreen from '../screens/AvatarSelectionScreen';
import EditTaskScreen from '../screens/tasks/EditTaskScreen';
import {View, ActivityIndicator} from 'react-native';

import Terms from '../screens/Terms';
import Menu from '../screens/Menu';
import Preferencies from '../screens/Preferencies/Index';

import AvatarUpdate from '../screens/AvatarUpdate';
import UserEdit from '../screens/UserEdit';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();
const Tab = createBottomTabNavigator();

// --- Icon Rendering Functions ---
const renderHomeIcon = ({focused, color}: {focused: boolean; color: string}) => {
  return focused ? (
    <CircularIconButton colorIcon={color} nameIcon="clipboard" />
  ) : (
    <Icon name="clipboard" size={20} color={color} />
  );
};

const renderNotificationsIcon = ({focused, color}: {focused: boolean; color: string}) => {
  return focused ? (
    <CircularIconButton colorIcon={color} nameIcon="bell" />
  ) : (
    <Icon name="bell" size={20} color={color} />
  );
};

const renderMenuIcon = ({focused, color}: {focused: boolean; color: string}) => {
  return focused ? (
    <CircularIconButton colorIcon={color} nameIcon="menu" />
  ) : (
    <Icon name="menu" size={20} color={color} />
  );
};

// --- Navigators ---
function AuthNavigator() {
  const {theme} = useTheme();
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: theme.statusBarStyle,
      }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
      <AuthStack.Screen name="AvatarSelection" component={AvatarSelectionScreen} />
    </AuthStack.Navigator>
  );
}

function HomeStackNavigator() {
  const {theme} = useTheme();
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: theme.statusBarStyle,
      }}>
      <MainStack.Screen name="Home" component={HomeScreen} />
      <MainStack.Screen name="TaskDetails" component={TaskDetailScreen} />
      <MainStack.Screen name="EditTask" component={EditTaskScreen} />
    </MainStack.Navigator>
  );
}

function MenuStackNavigator() {
  const {theme} = useTheme();
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false,
        statusBarStyle: theme.statusBarStyle,
      }}>
      <MainStack.Screen name="Home" component={Menu} />
      <MainStack.Screen name="Terms" component={Terms} />
      <MainStack.Screen name="Preferencies" component={Preferencies} />
      <MainStack.Screen name="AvatarUpdate" component={AvatarUpdate} />
      <MainStack.Screen name="UserEdit" component={UserEdit} />
    </MainStack.Navigator>
  );
}

function MainTabNavigator() {
  const {theme} = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 80,
          backgroundColor: theme.colors.secondaryBg,
        },
        tabBarActiveTintColor: theme.colors.secondaryBg,
        tabBarInactiveTintColor: theme.colors.primary,
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="HomeStack"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: renderHomeIcon,
          tabBarIconStyle: {
            marginTop: 20,
          },
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: renderNotificationsIcon,
          tabBarIconStyle: {
            marginTop: 20,
          },
        }}
      />
      <Tab.Screen
        name="MenuStackNavigator"
        component={MenuStackNavigator}
        options={{
          tabBarIcon: renderMenuIcon,
          tabBarIconStyle: {
            marginTop: 20,
          },
        }}
      />
    </Tab.Navigator>
  );
}

// --- Root Navigator ---
const AppNavigator = () => {
  const {idToken, isLoading} = useAuth();
  const {theme} = useTheme();
  console.log('AppNavigator rendering. Has idToken:', !!idToken, 'IsLoading:', isLoading);
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.background,
        }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>{idToken ? <MainTabNavigator /> : <AuthNavigator />}</NavigationContainer>
  );
};

export default AppNavigator;
