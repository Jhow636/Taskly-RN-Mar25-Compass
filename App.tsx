import {MMKV} from 'react-native-mmkv';
import React from 'react';
import 'react-native-gesture-handler';
import {ThemeProvider} from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';

const MMKV_ENCRIPTION_KEY = 'minha-chave-secreta-super-forte-para-taskly-123!';

export const storage = new MMKV({
  id: 'user-preferences-storage',
  encryptionKey: MMKV_ENCRIPTION_KEY,
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
