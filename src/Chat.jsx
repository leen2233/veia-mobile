import {
  ArrowLeft,
  EllipsisVertical,
  Mic,
  Paperclip,
  Send,
  Smile,
} from 'lucide-react-native';
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import Avatar from './components/avatar';
import {ScrollView} from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useEffect, useRef, useState} from 'react';
import Message from './components/message';

const Chat = ({navigation}) => {
  const [data, setData] = useState([]);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef(null);
  const showSend = useSharedValue(inputValue.length > 0);

  useEffect(() => {
    setData([
      {text: 'Hey!', sender: 'me', timestamp: '2023-10-01T12:00:00Z'},
      {text: 'Hello!', sender: 'other', timestamp: '2023-10-01T12:01:00Z'},
      {text: 'How are you?', sender: 'me', timestamp: '2023-10-01T12:02:00Z'},
      {
        text: 'I am fine, thanks!',
        sender: 'other',
        timestamp: '2023-10-01T12:03:00Z',
      },
      {
        text: 'What are your plans for today?',
        sender: 'other',
        timestamp: '2023-10-01T12:04:00Z',
      },
      {
        text: 'I have a meeting at 2pm',
        sender: 'me',
        timestamp: '2023-10-01T12:05:00Z',
      },
      {
        text: 'Good luck with that!',
        sender: 'other',
        timestamp: '2023-10-01T12:06:00Z',
      },
      {text: 'Thanks!', sender: 'me', timestamp: '2023-10-01T12:07:00Z'},
      {
        text: 'Should we meet for coffee after?',
        sender: 'other',
        timestamp: '2023-10-01T12:08:00Z',
      },
      {
        text: 'Sure, sounds great!',
        sender: 'me',
        timestamp: '2023-10-01T12:09:00Z',
      },
      {text: 'Hey!', sender: 'me', timestamp: '2023-10-01T12:00:00Z'},
      {text: 'Hello!', sender: 'other', timestamp: '2023-10-01T12:01:00Z'},
      {text: 'How are you?', sender: 'me', timestamp: '2023-10-01T12:02:00Z'},
      {
        text: 'I am fine, thanks!',
        sender: 'other',
        timestamp: '2023-10-01T12:03:00Z',
      },
      {
        text: 'What are your plans for today?',
        sender: 'other',
        timestamp: '2023-10-01T12:04:00Z',
      },
      {
        text: 'I have a meeting at 2pm',
        sender: 'me',
        timestamp: '2023-10-01T12:05:00Z',
        status: 'read',
      },
      {
        text: 'Good luck with that!',
        sender: 'other',
        timestamp: '2023-10-01T12:06:00Z',
      },
      {
        text: 'Thanks!',
        sender: 'me',
        timestamp: '2023-10-01T12:07:00Z',
        status: 'read',
      },
      {
        text: 'Should we meet for coffee after?',
        sender: 'other',
        timestamp: '2023-10-01T12:08:00Z',
      },
      {
        text: 'Sure, sounds great! Sure, sounds great Sure, sounds great! Sure, sounds great Sure, sounds great! Sure, sounds great Sure, sounds great! Sure, sounds great ',
        sender: 'me',
        timestamp: '2023-10-01T12:09:00Z',
        status: 'sent',
      },
    ]);
  }, []);

  const sendMessage = () => {
    setData([...data, {text: inputValue, sender: 'me', timestamp: new Date()}]);
    setInputValue('');
    scrollRef.current.scrollToEnd({animated: true});
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        scrollRef.current.scrollToEnd({animated: true});
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({animated: false});
    }
  });

  useEffect(() => {
    showSend.value = inputValue.length > 0;
  }, [inputValue]);

  const sendStyle = useAnimatedStyle(() => ({
    opacity: withTiming(showSend.value ? 1 : 0, {duration: 200}),
    transform: [{scale: withTiming(showSend.value ? 1 : 0.8, {duration: 200})}],
    display: showSend.value ? 'flex' : 'none',
  }));

  const attachStyle = useAnimatedStyle(() => ({
    opacity: withTiming(showSend.value ? 0 : 1, {duration: 200}),
    transform: [{scale: withTiming(showSend.value ? 0.8 : 1, {duration: 200})}],
    display: showSend.value ? 'none' : 'flex',
  }));

  return (
    <View style={{flex: 1}}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={isKeyboardVisible ? 0 : -50}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
            <TouchableNativeFeedback
              onPress={() => navigation.navigate('Home')}>
              <ArrowLeft color={'white'} />
            </TouchableNativeFeedback>
            <Avatar
              url={
                'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/58.jpg'
              }
              width={50}
            />
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                gap: 5,
              }}>
              <Text style={{color: 'white', fontSize: 18}}>John Doe</Text>
              <Text style={{color: '#ababab'}}>2 minute ago</Text>
            </View>
          </View>
          <TouchableNativeFeedback>
            <EllipsisVertical color={'white'} />
          </TouchableNativeFeedback>
        </View>
        <ScrollView
          style={styles.chatContainer}
          ref={scrollRef}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-end',
            paddingBottom: 100,
          }}>
          {data.map((message, index) => (
            <Message
              key={index}
              text={message.text}
              time={message.timestamp}
              sender={message.sender}
              status={message.status}
            />
          ))}
        </ScrollView>
        <View style={styles.inputContainer}>
          <TouchableNativeFeedback>
            <Smile color={'white'} />
          </TouchableNativeFeedback>
          <TextInput
            style={styles.input}
            placeholder="Message"
            placeholderTextColor={'white'}
            value={inputValue}
            onChangeText={text => setInputValue(text)}
          />
          <Animated.View style={sendStyle}>
            <TouchableNativeFeedback onPress={sendMessage}>
              <View style={styles.sendButton}>
                <Send color={'white'} />
              </View>
            </TouchableNativeFeedback>
          </Animated.View>

          <Animated.View style={[{flexDirection: 'row', gap: 10}, attachStyle]}>
            <TouchableNativeFeedback>
              <Paperclip color={'white'} />
            </TouchableNativeFeedback>
            <TouchableNativeFeedback>
              <Mic color={'white'} />
            </TouchableNativeFeedback>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default Chat;

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    flex: 1,
  },
  header: {
    height: 80,
    width: '100%',
    backgroundColor: '#202324',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    zIndex: 10,
    alignItems: 'center',
    paddingHorizontal: 15,
    borderColor: 'grey',
    borderWidth: 1,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  chatContainer: {
    // flex: 1,
    paddingTop: 90,
    backgroundColor: '#141516',
  },
  inputContainer: {
    height: 60,
    backgroundColor: '#202324',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    gap: 10,
    marginBottom: 0,
  },
  input: {
    flex: 1,
    backgroundColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 15,
    height: '70%',
    color: 'white',
  },
  sendButton: {
    borderRadius: 30,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 2,
    paddingTop: 2,
    backgroundColor: '#c96442',
  },
});
