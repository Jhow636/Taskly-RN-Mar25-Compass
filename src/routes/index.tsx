import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import Home from '../screens/Home';
import Notifications from '../screens/Notifications';
import Menu from '../screens/Menu';
import Icon from '@react-native-vector-icons/feather';

import CircularIconButton from '../components/CircularIconButton';

export default function Route() {
  const Stack = createNativeStackNavigator();
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: {
          height: 80,
        },
        

      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
          tabBarLabel: '',
          tabBarIcon: ({focused , color}) => {
            return ( focused ? (
              <CircularIconButton colorIcon={color} nameIcon='clipboard'/>
              ) :

              (
                <Icon name="clipboard" size={20} color={color} />
              )
            )
          },
          tabBarIconStyle: {
            marginTop: 20,
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#5B3CC4',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={Notifications}
        options={{
          headerShown: false,
          tabBarLabel: '',
          tabBarIcon: ({color, focused}) => {
            return ( focused ? (
              <CircularIconButton colorIcon={color} nameIcon='bell' />
              ) :

              (
                <Icon name="bell" size={20} color={color} />
              )
            )
          },
          tabBarIconStyle: {
            marginTop: 20,
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#5B3CC4',
        }}
      />
      <Stack.Screen
        name="Menu"
        component={Menu}
        options={{
          headerShown: false,
          tabBarLabel: '',
          tabBarIcon: ({color, focused}) => {
            return ( focused ? (
              <CircularIconButton colorIcon={color} nameIcon='menu'/>
              ) :

              (
                <Icon name="menu" size={20} color={color} />
              )
            )
          },
          tabBarIconStyle: {
            marginTop: 20,
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#5B3CC4',
        }}
      />
    </Tab.Navigator>
  );
}
