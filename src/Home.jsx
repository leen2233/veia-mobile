import {MenuIcon, Search, CheckCheck, Pen} from 'lucide-react-native';
import {useEffect, useState, useRef, use} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  TouchableNativeFeedback,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {format, isToday, differenceInMinutes, parseISO} from 'date-fns';
import Avatar from './components/avatar';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Reanimated, {
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {useDrawerProgress} from '@react-navigation/drawer';

const Header = ({navigation, top}) => {
  return (
    <View style={[styles.header, {padding: top, height: top + 60}]}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <MenuIcon color={'white'} size={20} />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: '#fff',
          textAlign: 'center',
          marginVertical: 10,
        }}>
        Veia
      </Text>
      <TouchableOpacity onPress={() => alert('This is a button!')}>
        <Search color={'white'} size={20} />
      </TouchableOpacity>
    </View>
  );
};

function HomeScreen({navigation}) {
  const [chats, setChats] = useState([]);
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
      setChats([
        {
          id: 'c123',
          name: 'Alice',
          avatar:
            'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/58.jpg',
          last_message: 'Hello, how are you?',
          last_message_timestamp: '2024-10-27T10:30:00Z',
          unread_count: 1,
        },
        {
          id: 'c456',
          name: 'Bob',
          avatar:
            'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/82.jpg',
          last_message: "I'm doing well, thanks!",
          last_message_timestamp: '2024-10-27T10:45:00Z',
          read: true,
        },
        {
          id: 'c789',
          name: 'Charlie',
          avatar:
            'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/49.jpg',
          last_message: 'Great to hear that.',
          last_message_timestamp: '2024-10-27T11:00:00Z',
          unread_count: 9,
        },
        {
          id: 'c101',
          name: 'David',
          avatar: 'https://avatars.githubusercontent.com/u/66113213',
          last_message: 'How about you?',
          last_message_timestamp: '2024-10-27T11:15:00Z',
        },
        {
          id: 'c121',
          name: 'Eve',
          avatar:
            'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/40.jpg',
          last_message: 'Fine, thank you.',
          last_message_timestamp: '2024-10-27T11:30:00Z',
        },
        {
          id: 'c132',
          name: 'Frank',
          avatar:
            'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/57.jpg',
          last_message: 'Nice to hear.',
          last_message_timestamp: '2024-10-27T11:45:00Z',
        },
        {
          id: 'c153',
          name: 'Grace',
          avatar: 'https://avatars.githubusercontent.com/u/14043520',
          last_message: 'Yes, everything is great!',
          last_message_timestamp: '2024-10-27T12:00:00Z',
          unread_count: 3,
        },
        {
          id: 'c164',
          name: 'Hannah',
          avatar: 'https://avatars.githubusercontent.com/u/10937239',
          last_message: 'How is work going?',
          last_message_timestamp: '2024-10-27T12:15:00Z',
        },
        {
          id: 'c175',
          name: 'Ivy',
          avatar: 'https://avatars.githubusercontent.com/u/9225634',
          last_message: 'Very good, and you?',
          last_message_timestamp: '2024-10-27T12:30:00Z',
        },
        {
          id: 'c186',
          name: 'Jack',
          avatar:
            'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/89.jpg',
          last_message: "I'm doing great. Thanks",
          last_message_timestamp: '2024-10-27T12:45:00Z',
          read: true,
        },
        {
          id: 'c187',
          name: 'Lena',
          avatar:
            'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/14.jpg',
          last_message: 'Just got back from vacation 😎',
          last_message_timestamp: '2024-10-27T13:15:42Z',
        },
        {
          id: 'c188',
          name: 'Miguel',
          avatar: 'https://avatars.githubusercontent.com/u/53592073',
          last_message: "Can't talk now, coffee is life ☕",
          last_message_timestamp: '2024-10-27T14:03:18Z',
        },
        {
          id: 'c189',
          name: 'Aisha',
          avatar: 'https://avatars.githubusercontent.com/u/9038191',
          last_message: 'Lol that was wild',
          last_message_timestamp: '2024-10-27T14:25:59Z',
        },
        {
          id: 'c190',
          name: 'Luca',
          avatar: 'https://avatars.githubusercontent.com/u/89960459',
          last_message: 'You free tonight?',
          last_message_timestamp: '2024-10-27T15:01:07Z',
        },
        {
          id: 'c191',
          name: 'Zara',
          avatar: 'https://avatars.githubusercontent.com/u/86530961',
          last_message: 'Meeting ran long 😩',
          last_message_timestamp: '2024-10-27T15:36:45Z',
        },
        {
          id: 'c192',
          name: 'Noah',
          avatar: 'https://avatars.githubusercontent.com/u/33398833',
          last_message: 'Did you see the news?',
          last_message_timestamp: '2024-10-27T16:12:30Z',
        },
        {
          id: 'c193',
          name: 'Yuki',
          avatar:
            'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/56.jpg',
          last_message: 'BRB, making noodles 🍜',
          last_message_timestamp: '2024-10-27T16:48:13Z',
        },
        {
          id: 'c194',
          name: 'Omar',
          avatar: 'https://avatars.githubusercontent.com/u/74700528',
          last_message: 'What time is the game?',
          last_message_timestamp: '2024-10-27T17:23:01Z',
        },
      ]);
    };

    fetchChats();
  }, []);

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
      <Header navigation={navigation} top={insets.top} />
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
