// In App.js in a new project

import * as React from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import HomeScreen from './src/Home';
import DrawerContent from './src/Drawer';
import ChatScreen from './src/Chat';

const Drawer = createDrawerNavigator();

function RootStack() {
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerStyle: {backgroundColor: '#202324'},
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        drawerStyle: {
          backgroundColor: '#202324',
          width: 300,
        },
      }}>
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{headerShown: false}}
      />
      <Drawer.Screen
        name="Chat"
        component={ChatScreen}
        options={{headerShown: false}}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <RootStack />
    </NavigationContainer>
  );
}
