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

import smapleChatsData from '../data';
import {useSelector} from 'react-redux';
import WebsocketService from './lib/WebsocketService';

const Header = ({navigation, top, isSearchOpen, setIsSearchOpen}) => {
  const isConnecting = useSelector(state => state.isConnecting.state);
  const [dotCount, setDotCount] = useState(1);
  const [searchText, setSearchText] = useState('');
  const searchInputRef = useRef();

  useEffect(() => {
    console.log('isConnecting', isConnecting);
  }, [isConnecting]);

  // Animation values
  const bounceValue = useSharedValue(0);
  const fadeValue = useSharedValue(1);
  const scaleValue = useSharedValue(1);
  const searchAnimValue = useSharedValue(0);
  const headerContentOpacity = useSharedValue(1);

  useEffect(() => {
    if (isConnecting) {
      const dotInterval = setInterval(() => {
        setDotCount(prev => (prev % 3) + 1);
      }, 500);
      return () => clearInterval(dotInterval);
    }
  }, [isConnecting]);

  useEffect(() => {
    fadeValue.value = withTiming(0, {duration: 200});
    scaleValue.value = withTiming(0.8, {duration: 150});
    const timer = setTimeout(() => {
      fadeValue.value = withTiming(1, {duration: 300});
      scaleValue.value = withSpring(1, {damping: 10, stiffness: 150});
    }, 200);
    return () => clearTimeout(timer);
  }, [isConnecting]);

  useEffect(() => {
    const checkAuthentication = async () => {
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) {
        navigation.navigate('Login');
      } else {
        WebsocketService.addListener(handleResponse);
        data = {action: 'authenticate', data: {access_token: accessToken}};
        WebsocketService.send(data);
      }
    };

    checkAuthentication();
  }, []);

  const handleResponse = async data => {
    if (data.action == 'authenticate') {
      if (!data.success) {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        data = {
          action: 'refresh_access_token',
          data: {refresh_token: refreshToken},
        };
        WebsocketService.send(data);
      }
    } else if (data.action == 'refresh_access_token') {
      if (data.success) {
        const accessToken = data.data.access_token;
        data = {action: 'authenticate', data: {access_token: accessToken}};
        await AsyncStorage.setItem('accessToken', accessToken);
      } else {
        AsyncStorage.removeItem('accessToken');
        AsyncStorage.removeItem('refreshToken');
        navigation.navigate('Login');
      }
    }
  };

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
    // Handle search logic here
    console.log('Search:', searchText);
    // You can add your search functionality here
  };

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
          {isConnecting ? `Connecting${getDots()}` : 'Veia'}
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
          placeholder="Search..."
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
  const [chats, setChats] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);
  const scrollDirection = useRef('up');
  const insets = useSafeAreaInsets();
  const progress = useDrawerProgress();

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(progress.value, [0, 1], [1, 0.99]);
    const translateX = interpolate(progress.value, [0, 1], [0, 30]);
    return {
      transform: [{scale}, {translateX}],
    };
  });

  function formatTimestamp(timestamp) {
    const date =
      typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, date);

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
        // Scrolling down
        scrollDirection.current = 'down';
        hideFloatingButton();
      } else if (scrollDelta < 0 && scrollDirection.current !== 'up') {
        // Scrolling up
        scrollDirection.current = 'up';
        showFloatingButton();
      }
    }

    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    const fetchChats = async () => {
      setChats(smapleChatsData);
    };

    fetchChats();
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      setChats([]);
    } else {
      setChats(smapleChatsData);
    }
  }, [isSearchOpen]);

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
      <ScrollView
        style={[styles.chatItemsContainer, {marginTop: insets.top + 60}]}
        onScroll={handleScroll}
        scrollEventThrottle={16}>
        {chats.map(chat => (
          <TouchableNativeFeedback
            key={chat.id}
            onPress={() => navigation.navigate('Chat')}>
            <View style={styles.chatItem}>
              <View
                style={{flexDirection: 'row', gap: 20, alignItems: 'center'}}>
                <Avatar url={chat.avatar} width={50} />
                <View style={{justifyContent: 'center', gap: 5}}>
                  <Text style={{color: 'white', fontSize: 18}}>
                    {chat.name}
                  </Text>
                  <Text style={{color: '#ababab'}}>{chat.last_message}</Text>
                </View>
              </View>
              <View style={{alignItems: 'center', gap: 8}}>
                <Text style={{color: '#ababab'}}>
                  {formatTimestamp(chat.last_message_timestamp)}
                </Text>
                {chat.unread_count && (
                  <Text style={styles.unreadBadge}>{chat.unread_count}</Text>
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
    verticalAlign: 'center',
    lineHeight: 20,
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
});
