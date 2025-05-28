import HomeScreen from './src/Home';
import DrawerContent from './src/Drawer';
import ChatScreen from './src/Chat';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const Stack = createNativeStackNavigator();

function RootStack() {
  return (
    <Stack.Navigator
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
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_left',
          // You can also configure per-screen if needed
          // swipeEnabled: true,
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
          swipeEnabled: true,
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
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
