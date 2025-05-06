import React from 'react';
import { MMKV } from 'react-native-mmkv';
import 'react-native-gesture-handler';
import { ThemeProvider } from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export const storage = new MMKV({
  id: 'user-preferences-storage',
});

const App = () => {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
};

export default App;
