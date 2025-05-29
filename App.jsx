import HomeScreen from './src/Home';
import DrawerContent from './src/Drawer';
import ChatScreen from './src/Chat';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {createStackNavigator} from '@react-navigation/stack';
import {Animated, StatusBar} from 'react-native';

const Stack = createStackNavigator();

function RootStack() {
  const forSlide = ({current, next, inverted, layouts: {screen}}) => {
    console.log(current);
    const progress = Animated.add(
      current.progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
      0,
    );

    return {
      cardStyle: {
        transform: [
          {
            translateX: Animated.multiply(
              progress.interpolate({
                inputRange: [0, 1, 2],
                outputRange: [screen.width, 0, screen.width * -0.3],
                extrapolate: 'clamp',
              }),
              inverted,
            ),
          },
        ],
      },
    };
  };
  const configOpen = {
    animation: 'timing',
    config: {
      duration: 200,
    },
  };
  const configClose = {
    animation: 'timing',
    config: {
      duration: 100,
    },
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#202324'},
        headerTintColor: '#fff',
        headerTitleAlign: 'center',
        swipeEnabled: true,
        overlayColor: 'rgba(0, 0, 0, 0.5)',
        detachPreviousScreen: false,
      }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          headerShown: false,
          swipeEnabled: true,
          animation: 'slide_from_right',

          gestureEnabled: true,
          gestureDirection: 'horizontal',
          gestureResponseDistance: 300,
          cardStyleInterpolator: forSlide,
          transitionSpec: {
            open: configOpen,
            close: configClose,
          },
        }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer style={{flex: 1}}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      <GestureHandlerRootView style={{flex: 1}}>
        <RootStack />
      </GestureHandlerRootView>
    </NavigationContainer>
  );
}
