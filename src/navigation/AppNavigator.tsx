import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme as NavigationDefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';
import HomeScreen from '../screens/home/HomeScreen';
import PreferencesScreen from '../screens/preferences/PreferencesScreen';
import { getLoginSession } from '../storage/userStorage';

export type MainStackParamList = {
  Home: undefined;
  Preferences: undefined;
};

const MainStack = createNativeStackNavigator<MainStackParamList>();

function MainNavigator() {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen name="Home" component={HomeScreen} />
      <MainStack.Screen name="Preferences" component={PreferencesScreen} />
    </MainStack.Navigator>
  );
}

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        await getLoginSession(); // Simula a verificação de login
      } catch (error) {
        console.error('Erro ao verificar sessão de login:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={{ ...NavigationDefaultTheme, colors: { ...NavigationDefaultTheme.colors, ...theme.colors } }}>
      <MainNavigator />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
