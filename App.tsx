import React from 'react';
import { MMKV } from 'react-native-mmkv';
import { View, Text } from 'react-native';
import 'react-native-gesture-handler';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

export const storage = new MMKV({
  id: 'user-preferences-storage',
});

function App() {

  const { theme } = useTheme();

  return (
    <ThemeProvider>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
        <Text style={{ color: theme.colors.mainText, ...theme.typography.bigTitle }}>Olá, Taskly!</Text>
      </View>
    </ThemeProvider>
  );
}

export default App;
