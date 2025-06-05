import {
  ArrowLeft,
  EllipsisVertical,
  MessageCircleReply,
  Mic,
  Paperclip,
  Send,
  Smile,
  X,
} from 'lucide-react-native';
import {
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from './components/avatar';
import {ScrollView} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {useEffect, useRef, useState} from 'react';
import Message from './components/message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Header from './components/chatHeader';
import WebsocketService from './lib/WebsocketService';

const Chat = ({route, navigation}) => {
  const [messages, setMessages] = useState([]);
  const [chat, setChat] = useState(route.params.chat);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState('');
  const scrollRef = useRef(null);
  const showSend = useSharedValue(inputValue.length > 0);
  const replyBarHeight = useSharedValue(0);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (chat) {
      WebsocketService.addListener(handleResponse);
      let data = {action: 'get_messages', data: {chat_id: chat.id}};
      WebsocketService.send(data);
    }
  }, [chat]);

  const handleResponse = data => {
    if (data.action == 'get_messages') {
      setMessages(data.data.results);
    } else if (data.action == 'new_message') {
      console.log(data.data.message, 'message');
      setMessages(messages => [...messages, data.data.message]);
      if (scrollRef.current) {
        scrollRef.current.scrollToEnd({animated: true});
      }
    }
  };

  const sendMessage = () => {
    let data = {
      action: 'new_message',
      data: {chat_id: chat.id, text: inputValue},
    };
    WebsocketService.send(data);
    setInputValue('');
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
  }, []);

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

  useEffect(() => {
    if (replyingTo) {
      replyBarHeight.value = withTiming(50, {duration: 300});
      scrollRef.current.scrollToEnd({animated: true});
    } else {
      replyBarHeight.value = withTiming(0, {duration: 300});
    }
  }, [replyingTo]);

  const replyingToAnimatedStyle = useAnimatedStyle(() => {
    const borderHeight = interpolate(replyBarHeight.value, [0, 50], [0, 1]);

    return {
      height: replyBarHeight.value,
      overflow: 'hidden',
      borderTopWidth: borderHeight,
      borderBottomWidth: borderHeight,
    };
  });

  return (
    <View style={{flex: 1}}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={isKeyboardVisible ? 0 : -50}>
        <Header top={insets.top} navigation={navigation} chat={chat} />
        <ScrollView
          style={styles.chatContainer}
          ref={scrollRef}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'flex-end',
            paddingBottom: isKeyboardVisible ? 100 : 100,
          }}>
          {messages.map((message, index) => (
            <Message
              key={index}
              message={message}
              onReply={message => {
                setReplyingTo(message);
              }}
            />
          ))}
        </ScrollView>

        <View>
          <Animated.View style={[styles.replyingTo, replyingToAnimatedStyle]}>
            {replyingTo && (
              <>
                <MessageCircleReply color={'#c96442'} />
                <Text style={{color: 'white', width: '80%'}} numberOfLines={1}>
                  {replyingTo.text}
                </Text>
                <TouchableNativeFeedback
                  onPress={() => {
                    setReplyingTo(null);
                  }}>
                  <X color={'white'} />
                </TouchableNativeFeedback>
              </>
            )}
          </Animated.View>
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

            <Animated.View
              style={[{flexDirection: 'row', gap: 10}, attachStyle]}>
              <TouchableNativeFeedback>
                <Paperclip color={'white'} />
              </TouchableNativeFeedback>
              <TouchableNativeFeedback>
                <Mic color={'white'} />
              </TouchableNativeFeedback>
            </Animated.View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    flex: 1,
  },
  chatContainer: {
    flex: 1,
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
  replyingTo: {
    backgroundColor: '#202324',
    // flex: 0.2,
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    borderTopColor: 'grey',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
});

export default Chat;
