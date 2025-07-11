import {
  MenuIcon,
  Search,
  CheckCheck,
  Pen,
  ArrowLeft,
} from 'lucide-react-native';
import {useEffect, useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TouchableNativeFeedback,
  TextInput,
  Keyboard,
  BackHandler,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {format, isToday, differenceInMinutes, parseISO} from 'date-fns';
import Avatar from './components/avatar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Reanimated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useDrawerProgress} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {useDispatch, useSelector} from 'react-redux';
import WebsocketService from './lib/WebsocketService';
import {setChats, setConnectionStatus, setUser} from './state/actions';

const Header = ({navigation, top, isSearchOpen, setIsSearchOpen}) => {
  const connectionStatus = useSelector(state => state.connectionStatus.state);
  const [dotCount, setDotCount] = useState(1);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef();

  const bounceValue = useSharedValue(0);
  const fadeValue = useSharedValue(1);
  const scaleValue = useSharedValue(1);
  const searchAnimValue = useSharedValue(0);
  const headerContentOpacity = useSharedValue(1);

  useEffect(() => {
    if (connectionStatus) {
      const dotInterval = setInterval(() => {
        setDotCount(prev => (prev % 3) + 1);
      }, 500);
      return () => clearInterval(dotInterval);
    }
  }, [connectionStatus]);

  useEffect(() => {
    fadeValue.value = withTiming(0, {duration: 200});
    scaleValue.value = withTiming(0.8, {duration: 150});
    const timer = setTimeout(() => {
      fadeValue.value = withTiming(1, {duration: 300});
      scaleValue.value = withSpring(1, {damping: 10, stiffness: 150});
    }, 200);
    return () => clearTimeout(timer);
  }, [connectionStatus]);

  // Search animation effect
  useEffect(() => {
    if (isSearchOpen) {
      headerContentOpacity.value = withTiming(0, {duration: 200});
      searchAnimValue.value = withSpring(1, {
        damping: 15,
        stiffness: 150,
      });
      searchInputRef.current.focus();
    } else {
      searchAnimValue.value = withTiming(0, {duration: 200});
      setTimeout(() => {
        headerContentOpacity.value = withTiming(1, {duration: 300});
      }, 100);

      Keyboard.dismiss();
    }
  }, [isSearchOpen]);

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: bounceValue.value}, {scale: scaleValue.value}],
      opacity: fadeValue.value,
    };
  });

  const headerContentStyle = useAnimatedStyle(() => {
    return {
      opacity: headerContentOpacity.value,
      transform: [
        {
          scale: interpolate(headerContentOpacity.value, [0, 1], [0.8, 1]),
        },
      ],
    };
  });

  const searchContainerStyle = useAnimatedStyle(() => {
    return {
      opacity: searchAnimValue.value,
      transform: [
        {
          scale: interpolate(searchAnimValue.value, [0, 1], [0.9, 1]),
        },
        {
          translateY: interpolate(searchAnimValue.value, [0, 1], [20, 0]),
        },
      ],
    };
  });

  const handleSearchOpen = () => {
    setIsSearchOpen(true);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchText('');
  };

  const handleSearchSubmit = () => {
    data = {action: 'search_users', data: {q: searchText}};
    WebsocketService.send(data);
  };

  useEffect(() => {
    if (isSearchOpen) {
      handleSearchSubmit();
    }
  }, [searchText]);

  const getDots = () => {
    return '.'.repeat(dotCount);
  };

  return (
    <View style={[styles.header, {padding: top, height: top + 60}]}>
      <Reanimated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'absolute',
            top: top,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            height: 60,
          },
          headerContentStyle,
        ]}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <MenuIcon color={'white'} size={20} />
        </TouchableOpacity>

        <Reanimated.Text
          style={[
            {
              fontSize: 20,
              fontWeight: 'bold',
              color: '#fff',
              textAlign: 'center',
              marginVertical: 10,
              flex: 1,
            },
            animatedTextStyle,
          ]}>
          {connectionStatus ? `Connecting${getDots()}` : 'Veia'}
        </Reanimated.Text>

        <TouchableOpacity onPress={handleSearchOpen}>
          <Search color={'white'} size={20} />
        </TouchableOpacity>
      </Reanimated.View>

      {/* Search Input Container */}
      <Reanimated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            position: 'absolute',
            top: top,
            left: 0,
            right: 0,
            paddingHorizontal: 16,
            height: 60,
            pointerEvents: isSearchOpen ? 'auto' : 'none',
          },
          searchContainerStyle,
        ]}>
        <TouchableOpacity
          onPress={handleSearchClose}
          style={{
            marginRight: 12,
            padding: 4,
          }}>
          <ArrowLeft color={'white'} size={20} />
        </TouchableOpacity>

        <TextInput
          style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 25,
            paddingHorizontal: 16,
            color: 'white',
            fontSize: 16,
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.3)',
            alignItems: 'center',
          }}
          placeholder="Search users..."
          placeholderTextColor="rgba(255, 255, 255, 0.7)"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearchSubmit}
          ref={searchInputRef}
          returnKeyType="search"
        />
      </Reanimated.View>
    </View>
  );
};

function HomeScreen({navigation}) {
  const chats = useSelector(state => state.chats.data);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const connectionStatus = useSelector(state => state.connectionStatus);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef('up');
  const insets = useSafeAreaInsets();
  const progress = useDrawerProgress();
  const dispatch = useDispatch();

  const loadedRef = useRef(false);
  const handlerAdded = useRef(false);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 0.99]);
    const translateX = interpolate(progress.value, [0, 1], [0, 30]);
    return {
      transform: [{scale}, {translateX}],
    };
  });

  const backAction = () => {
    if (isSearchOpen) {
      setIsSearchOpen(false);
      return true;
    }
    return false;
  };

  useEffect(() => {
    if (chats.length > 0) {
      if (!loadedRef.current) {
        loadedRef.current = true;
        return;
      }
      AsyncStorage.setItem('savedChats', JSON.stringify(chats));
      AsyncStorage.setItem('lastUpdatedTime', (Date.now() / 1000).toString());
      console.log('saved data', chats);
    }
  }, [chats]);

  useEffect(() => {
    const loadData = async () => {
      const data = await AsyncStorage.getItem('savedChats');
      if (data) {
        const dataParsed = JSON.parse(data);
        dispatch(setChats(dataParsed));
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!handlerAdded.current) {
      WebsocketService.addListener(handleResponse);
      handlerAdded.current = true;
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );

    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    if (!connectionStatus.state && !connectionStatus.isAuthenticated) {
      const checkAuthentication = async () => {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) {
          navigation.navigate('Login');
        } else {
          if (!handlerAdded.current) {
            WebsocketService.addListener(handleResponse);
            handlerAdded.current = true;
          }
          data = {action: 'authenticate', data: {access_token: accessToken}};
          WebsocketService.send(data);
        }
      };

      checkAuthentication();
    }
  }, [connectionStatus]);

  const handleResponse = async data => {
    if (data.action == 'authenticate') {
      if (!data.success) {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        let dataToSend = {
          action: 'refresh_access_token',
          data: {refresh_token: refreshToken},
        };
        WebsocketService.send(dataToSend);
      } else {
        dispatch(setConnectionStatus({isAuthenticated: true}));
        dispatch(setUser(data.data.user));
        const savedChats = await AsyncStorage.getItem('savedChats');
        if (savedChats) {
          const lastUpdatedTime = parseInt(
            await AsyncStorage.getItem('lastUpdatedTime'),
          );
          let dataToSend = {
            action: 'get_updates',
            data: {last_time: lastUpdatedTime},
          };
          WebsocketService.send(dataToSend);
        } else {
          let dataToSend = {action: 'get_chats'};
          WebsocketService.send(dataToSend);
        }
      }
    } else if (data.action == 'refresh_access_token') {
      if (data.success) {
        const accessToken = data.data.access_token;
        dataToSend = {
          action: 'authenticate',
          data: {access_token: accessToken},
        };
        await AsyncStorage.setItem('accessToken', accessToken);
        WebsocketService.send(dataToSend);
      } else {
        AsyncStorage.removeItem('accessToken');
        AsyncStorage.removeItem('refreshToken');
        navigation.navigate('Login');
      }
    } else if (data.action == 'get_chats') {
      dispatch(setChats(data.data.results));
    } else if (data.action == 'search_users') {
      setSearchResults(data.data.results);
    }
  };

  function formatTimestamp(timestamp) {
    const date =
      typeof timestamp === 'string'
        ? parseISO(timestamp)
        : new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, date);

    if (diffInMinutes === 0) {
      return 'Just Now';
    }

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }

    if (isToday(date)) {
      return format(date, 'HH:mm');
    }

    return format(date, 'MMM d');
  }

  const hideFloatingButton = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const showFloatingButton = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleScroll = event => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDelta = currentScrollY - lastScrollY.current;

    // Only react to significant scroll movements (threshold of 5px)
    if (Math.abs(scrollDelta) > 5) {
      if (scrollDelta > 0 && scrollDirection.current !== 'down') {
        scrollDirection.current = 'down';
        hideFloatingButton();
      } else if (scrollDelta < 0 && scrollDirection.current !== 'up') {
        scrollDirection.current = 'up';
        showFloatingButton();
      }
    }

    lastScrollY.current = currentScrollY;
  };

  return (
    <Reanimated.View
      style={[
        {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#141516',
        },
        ,
        animatedStyle,
      ]}>
      <Header
        navigation={navigation}
        top={insets.top}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />
      {isSearchOpen ? (
        <ScrollView
          style={[styles.chatItemsContainer, {marginTop: insets.top + 60}]}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          <View style={styles.resultCountView}>
            <Text style={{color: '#ababab'}}>Search results:</Text>
            {searchResults && (
              <Text style={{color: '#ababab'}}>
                {searchResults.length} users
              </Text>
            )}
          </View>
          {searchResults.length > 0 &&
            searchResults.map(user => (
              <TouchableNativeFeedback
                key={user.id}
                onPress={() => navigation.navigate('Chat', {user: user})}>
                <View style={styles.chatItem}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 20,
                      alignItems: 'center',
                    }}>
                    <Avatar
                      url={user?.avatar}
                      name={user.display_name}
                      width={50}
                    />
                    <View style={{justifyContent: 'center', gap: 5}}>
                      <Text style={{color: 'white', fontSize: 18}}>
                        {user.display_name}
                      </Text>
                      <Text style={{color: '#ababab'}}>{user.email}</Text>
                    </View>
                  </View>
                </View>
              </TouchableNativeFeedback>
            ))}
        </ScrollView>
      ) : (
        <ScrollView
          style={[styles.chatItemsContainer, {marginTop: insets.top + 60}]}
          onScroll={handleScroll}
          scrollEventThrottle={16}>
          {chats.length > 0 &&
            chats.map(chat => (
              <TouchableNativeFeedback
                key={chat.id}
                onPress={() => navigation.navigate('Chat', {chat: chat})}
                onLongPress={() => console.log('Long pressed:', chat.messages)}>
                <View style={styles.chatItem}>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: 20,
                      alignItems: 'center',
                    }}>
                    <Avatar
                      url={chat.user.avatar}
                      name={chat.user.display_name}
                      width={50}
                    />
                    {chat.user.is_online && (
                      <View style={styles.onlineIndicator} />
                    )}
                    <View style={{justifyContent: 'center', gap: 5}}>
                      <Text style={{color: 'white', fontSize: 18}}>
                        {chat.user.display_name}
                      </Text>
                      <Text style={{color: '#ababab'}}>
                        {chat.messages && chat.messages.length > 0
                          ? chat.messages[chat.messages.length - 1].text
                          : chat?.last_message}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={{
                      alignItems: 'center',
                      gap: 8,
                    }}>
                    <Text style={{color: '#ababab'}}>
                      {formatTimestamp(chat.updated_at)}
                    </Text>
                    {chat.unread_count && (
                      <Text style={styles.unreadBadge}>
                        {chat.unread_count}
                      </Text>
                    )}
                    {chat.read && (
                      <Text style={styles.read}>
                        <CheckCheck color={'#c96442'} size={18} />
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableNativeFeedback>
            ))}
        </ScrollView>
      )}
      <Animated.View
        style={[
          styles.floatingButton,
          {
            opacity: fadeAnim,
            transform: [{translateY: translateYAnim}],
          },
        ]}>
        <TouchableNativeFeedback>
          <View style={styles.floatingButtonInner}>
            <Pen color={'white'} />
          </View>
        </TouchableNativeFeedback>
      </Animated.View>
    </Reanimated.View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#202324',
    paddingHorizontal: 20,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  chatItemsContainer: {
    width: '100%',
  },
  chatItem: {
    width: '100%',
    height: 80,
    justifyContent: 'center',
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 20,
    borderBottomColor: '#4A4F4B',
    borderBottomWidth: 1,
  },
  unreadBadge: {
    backgroundColor: '#c96442',
    color: 'white',
    width: 20,
    height: 20,
    borderRadius: 10,
    textAlign: 'center',
    lineHeight: 25,
    fontSize: 12,
    fontWeight: 'bold',
  },
  read: {
    color: '#c96442',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
  },
  floatingButtonInner: {
    width: 60,
    height: 60,
    backgroundColor: '#c96442',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultCountView: {
    height: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#202324',
    borderBottomColor: '#4A4F4B',
    borderBottomWidth: 1,
    borderTopColor: '#4A4F4B',
    borderTopWidth: 1,
  },
  onlineIndicator: {
    backgroundColor: '#c96442',
    width: 17,
    height: 17,
    borderRadius: 9,
    position: 'absolute',
    bottom: 0,
    left: 35,
    borderWidth: 2,
    borderColor: '#141516',
  },
});
