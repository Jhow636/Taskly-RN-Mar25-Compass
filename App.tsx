import React from 'react';
import 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import SignupScreen from './src/screens/SignupScreen';
import AvatarSelectionScreen from './src/screens/AvatarSelectionScreen';

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

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Signup"
        screenOptions={{headerShown: false}}>
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen
          name="AvatarSelection"
          component={AvatarSelectionScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
