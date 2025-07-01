import HomeScreen from './src/Home';
import DrawerContent from './src/Drawer';
import ChatScreen from './src/Chat';
import React, {useCallback, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {createStackNavigator} from '@react-navigation/stack';
import {Animated, StatusBar} from 'react-native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import WebsocketService from './src/lib/WebsocketService';
import {Provider, useDispatch, useSelector} from 'react-redux';
import {store} from './src/state/store';
import {addMessageToChat, setConnectionStatus} from './src/state/actions';
import LoginPage from './src/Login';
import RegisterPage from './src/Register';
import EditProfile from './src/EditProfile';
import SettingsScreen from './src/Settings';
import UISettings from './src/settings/UI';

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
        swipeEdgeWidth: 300,
        drawerStyle: {width: 270},
      }}>
      <Drawer.Screen name="HomeMain" component={HomeScreen} />
    </Drawer.Navigator>
  );
}

function RootStack() {
  const dispatch = useDispatch();
  // const user = useSelector(state => state.user);

  const handleResponse = useCallback(
    data => {
      if (data.action == 'new_message') {
        dispatch(addMessageToChat(data.data.message));
      } else if (data.action == 'status_change') {
        dispatch({
          type: 'STATUS_CHANGE',
          userId: data.data.user_id,
          status: data.data.status,
          last_seen: data.data.last_seen,
        });
      } else if (data.action == 'delete_message') {
        dispatch({
          type: 'DELETE_MESSAGE',
          messageId: data.data.id,
        });
      } else if (data.action == 'edit_message') {
        dispatch({
          type: 'EDIT_MESSAGE',
          messageId: data.data.id,
          text: data.data.text,
        });
      } else if (data.action == 'read_message') {
        dispatch({
          type: 'READ_MESSAGE',
          messageIds: data.data.ids,
        });
      }
    },
    [dispatch],
  );

  useEffect(() => {
    WebsocketService.setStatusCallback(status => {
      dispatch(setConnectionStatus(status));
    });
    WebsocketService.addListener(handleResponse);

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
      initialRouteName="Home">
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
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
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
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
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
      <Stack.Screen
        name="UISettings"
        component={UISettings}
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
