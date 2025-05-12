import {MMKV} from 'react-native-mmkv';
import React, {useState, useEffect} from 'react';
import 'react-native-gesture-handler';
import {ThemeProvider} from './src/theme/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import {AuthProvider} from './src/context/AuthContext';
import SplashScreen from './src/screens/SplashScreen';

const MMKV_ENCRIPTION_KEY = 'minha-chave-secreta-super-forte-para-taskly-123!';

export const storage = new MMKV({
  id: 'user-preferences-storage',
  encryptionKey: MMKV_ENCRIPTION_KEY,
});

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>{showSplash ? <SplashScreen /> : <AppNavigator />}</AuthProvider>
    </ThemeProvider>
  );
};

export default App;
