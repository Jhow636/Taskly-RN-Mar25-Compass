import React from 'react';
import { MMKV } from 'react-native-mmkv';
import 'react-native-gesture-handler';
import { ThemeProvider } from './src/theme/ThemeContext';

import LoginScreen from './src/screens/login/LoginScreen';

export const storage = new MMKV({
  id: 'user-preferences-storage',
});

function App() {

  return (
    <ThemeProvider>
        <LoginScreen />
    </ThemeProvider>
  );
}

export default App;
