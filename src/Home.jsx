import {MenuIcon, Search} from 'lucide-react-native';
import {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TouchableNativeFeedback,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import {format, isToday, differenceInMinutes, parseISO} from 'date-fns';

const Header = ({navigation}) => {
  return (
    <View style={styles.header}>
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

  function formatTimestamp(timestamp) {
    const date =
      typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, date);

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }

    if (isToday(date)) {
      return format(date, 'HH:mm'); // like "16:50"
    }

    return format(date, 'MMM d'); // like "Apr 20"
  }

  useEffect(() => {
    const fetchChats = async () => {
      // try {
      //   const response = await fetch(
      //     'https://veia-chat.free.beeceptor.com/chats',
      //   );
      //   const data = await response.json();
      //   setChats(data);
      // } catch (error) {
      //   console.error('Error fetching chats:', error);
      // }
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
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#141516',
      }}>
      <Header navigation={navigation} />
      <ScrollView style={styles.chatItemsContainer}>
        {chats.map(chat => (
          <TouchableNativeFeedback key={chat.id}>
            <View style={styles.chatItem}>
              <View style={{flexDirection: 'row', gap: 20}}>
                <Image
                  source={{
                    uri: chat.avatar,
                  }}
                  style={styles.chatItemAvatar}
                />
                <View style={{justifyContent: 'center', gap: 5}}>
                  <Text style={{color: 'white', fontSize: 18}}>
                    {chat.name}
                  </Text>
                  <Text style={{color: '#ababab'}}>{chat.last_message}</Text>
                </View>
              </View>
              <View style={{alignItems: 'center', gap: 6}}>
                <Text style={{color: '#ababab'}}>
                  {formatTimestamp(chat.last_message_timestamp)}
                </Text>
                {chat.unread_count && (
                  <Text style={styles.unreadBadge}>{chat.unread_count}</Text>
                )}
              </View>
            </View>
          </TouchableNativeFeedback>
        ))}
      </ScrollView>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#202324',
    padding: 20,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 80,
    position: 'absolute',
    top: 0,
  },
  chatItemsContainer: {
    width: '100%',
    marginTop: 80,
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
  chatItemAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
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
});
