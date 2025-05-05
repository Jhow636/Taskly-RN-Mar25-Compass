import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import Route from './src/navigation/AppNavigator';

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Route />
    </NavigationContainer>
  );
};

export default App;
