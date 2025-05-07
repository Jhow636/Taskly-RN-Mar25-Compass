import {MMKV} from 'react-native-mmkv';
import React from 'react';
import 'react-native-gesture-handler';
import {ThemeProvider} from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';

export const storage = new MMKV({
  id: 'user-preferences-storage',
});

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
