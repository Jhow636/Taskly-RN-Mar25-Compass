import {MMKV} from 'react-native-mmkv';
import React from 'react';
import 'react-native-gesture-handler';
import {ThemeProvider} from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext'; // Import AuthProvider
import SignupScreen from './src/screens/SignupScreen';
import AvatarSelectionScreen from './src/screens/AvatarSelectionScreen';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Signup: undefined;
  AvatarSelection: {
    userData: {
      fullName: string;
      email: string;
      phone: string;
    };
    password: string;
  };
  Login: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

// Inicializa e exporta a instância do MMKV
export const storage = new MMKV({
  id: 'user-preferences-storage',
});

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
        <Stack.Navigator
          initialRouteName="Signup"
          screenOptions={{headerShown: false}}>
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen
            name="AvatarSelection"
            component={AvatarSelectionScreen}
          />
        </Stack.Navigator>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
