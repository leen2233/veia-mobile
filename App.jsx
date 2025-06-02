import HomeScreen from './src/Home';
import DrawerContent from './src/Drawer';
import ChatScreen from './src/Chat';
import React, {useEffect} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {createStackNavigator} from '@react-navigation/stack';
import {Animated, StatusBar} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import WebsocketService from './src/lib/WebsocketService';
import {Provider, useDispatch} from 'react-redux';
import store from './src/state/store';
import {setIsConnecting} from './src/state/actions';
import LoginPage from './src/Login';
import RegisterPage from './src/Register';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function HomeDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={props => <DrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerPosition: 'left',
        swipeEnabled: true,
        swipeEdgeWidth: 200,
        drawerStyle: {width: 270},
      }}>
      <Drawer.Screen name="HomeMain" component={HomeScreen} />
    </Drawer.Navigator>
  );
}

function RootStack() {
  const dispatch = useDispatch();

  useEffect(() => {
    WebsocketService.setStatusCallback(status => {
      console.log('dispatch called', status);
      dispatch(setIsConnecting(status));
    });

    WebsocketService.connect();
  }, []);

  const forSlide = ({current, next, inverted, layouts: {screen}}) => {
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
      }}
      initialRouteName="Login">
      <Stack.Screen
        name="Login"
        component={LoginPage}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Register"
        component={RegisterPage}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="Home"
        component={HomeDrawer}
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
    <Provider store={store}>
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
    </Provider>
  );
}
