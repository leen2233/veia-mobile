// In App.js in a new project

import HomeScreen from './src/Home';
import DrawerContent from './src/Drawer';
import ChatScreen from './src/Chat';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

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
        swipeEnabled: true,
        swipeEdgeWidth: 500,
        swipeMinDistance: 10,
        drawerType: 'slide',
        overlayColor: 'rgba(0, 0, 0, 0.5)',

        gestureHandlerProps: {
          enableTrackpadTwoFingerGesture: true,
        },
      }}>
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          // You can also configure per-screen if needed
          // swipeEnabled: true,
        }}
      />
      <Drawer.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
          swipeEnabled: true,
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <GestureHandlerRootView style={{flex: 1}}>
        <RootStack />
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}
