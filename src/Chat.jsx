import {
  CheckLine,
  MessageCircleReply,
  Mic,
  Paperclip,
  PenLine,
  Send,
  Smile,
  X,
} from 'lucide-react-native';
import {
  ImageBackground,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {useEffect, useRef, useState} from 'react';
import Message from './components/message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Header from './components/chatHeader';
import WebsocketService from './lib/WebsocketService';
import {useDispatch, useSelector} from 'react-redux';
import {addChat, setMessages} from './state/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Chat = ({route, navigation}) => {
  const chats = useSelector(state => state.chats);
  const user = useSelector(state => state.user);
  const [chat, setChat] = useState(null); // useSelector(state => state.chats.,);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const scrollRef = useRef(null);
  const showSend = useSharedValue(inputValue.length > 0);
  const replyBarHeight = useSharedValue(0);
  const editBarHeight = useSharedValue(0);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const settings = useSelector(state => state.settings);

  const chatId = useRef(route.params.chat?.id);
  const messages = chat?.messages || [];

  useEffect(() => {
    WebsocketService.addListener(handleResponse);
    return () => {
      WebsocketService.removeListener(handleResponse);
    };
  }, []);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('chat_settings');
        if (savedSettings !== null) {
          dispatch({type: 'SET_SETTINGS', payload: JSON.parse(savedSettings)}); // Dispatch an action to set settings in Redux
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (chat && !chat.messages) {
      console.log(chat, chat.messages);
      let data = {action: 'get_messages', data: {chat_id: chat.id}};
      WebsocketService.send(data);
    } else if (route.params.user) {
      data = {action: 'get_messages', data: {user_id: route.params.user.id}};
      WebsocketService.send(data);
    }
  }, [chat, route.params.user]);

  useEffect(() => {
    if (chats.data.find(c => c.id === chatId.current) != chat) {
      setChat(chats.data.find(c => c.id === chatId.current));
    }
  }, [chats]);

  useEffect(() => {
    scrollRef.current.scrollToEnd({animated: true});
  }, [chat?.messages]);

  const handleResponse = data => {
    if (data.action == 'get_messages') {
      if (!chat) {
        dispatch(addChat(data.data.chat));
      }
      chatId.current = data.data.chat.id;
      const messages = data.data.results.map(message => ({
        ...message,
        is_mine: message.sender === user.id,
      }));
      dispatch(setMessages(messages, chatId.current));
    }
  };

  const sendMessage = () => {
    if (editingMessage) {
      let data = {
        action: 'edit_message',
        data: {
          message_id: editingMessage.id,
          text: inputValue,
        },
      };
      WebsocketService.send(data);
      setInputValue('');
      setEditingMessage(null);
    } else {
      let data = {
        action: 'new_message',
        data: {
          chat_id: chat.id,
          text: inputValue,
          reply_to: replyingTo ? replyingTo.id : null,
        },
      };
      WebsocketService.send(data);
      setInputValue('');
      setReplyingTo(null);
    }
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
      replyBarHeight.value = withTiming(50, {duration: 200});
    } else {
      replyBarHeight.value = withTiming(0, {duration: 200});
    }
  }, [replyingTo]);

  useEffect(() => {
    if (editingMessage) {
      editBarHeight.value = withTiming(50, {duration: 200});
    } else {
      editBarHeight.value = withTiming(0, {duration: 200});
    }
  }, [editingMessage]);

  const replyingToAnimatedStyle = useAnimatedStyle(() => {
    const borderHeight = interpolate(replyBarHeight.value, [0, 50], [0, 1]);

    return {
      height: replyBarHeight.value,
      overflow: 'hidden',
      borderTopWidth: borderHeight,
      borderBottomWidth: borderHeight,
    };
  });

  const editBarAnimatedStyle = useAnimatedStyle(() => {
    const borderHeight = interpolate(editBarHeight.value, [0, 50], [0, 1]);

    return {
      height: editBarHeight.value,
      overflow: 'hidden',
      borderTopWidth: borderHeight,
      borderBottomWidth: borderHeight,
    };
  });

  useEffect(() => {
    const unreadMesages = messages.filter(
      message => message.status != 'read' && !message.is_mine,
    );
    if (unreadMesages.length > 0) {
      const message_ids = unreadMesages.map(message => message.id);
      const data = {
        action: 'read_message',
        data: {
          message_ids: message_ids,
        },
      };
      WebsocketService.send(data);
    }
  }, [messages]);

  return (
    <View style={{flex: 1}}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={isKeyboardVisible ? 0 : -50}>
        <Header top={insets.top} navigation={navigation} chat={chat} />
        <ImageBackground
          style={{flex: 1, backgroundColor: '#141516'}}
          source={{uri: settings.backgroundImage}}>
          <ScrollView
            style={styles.chatContainer}
            ref={scrollRef}
            keyboardShouldPersistTaps="handled" // This is key
            keyboardDismissMode="none"
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'flex-end',
              paddingBottom: 10,
              paddingTop: 120,
            }}>
            {messages.map((message, index) => (
              <Message
                key={index}
                message={message}
                onReply={message => {
                  setReplyingTo(message);
                }}
                onEdit={message => {
                  setEditingMessage(message);
                  setInputValue(message.text);
                }}
                myBubbleColor={settings.myBubbleColor}
                otherBubbleColor={settings.otherBubbleColor}
                fontSize={settings.fontSize}
              />
            ))}
          </ScrollView>
        </ImageBackground>

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
          <Animated.View style={[styles.replyingTo, editBarAnimatedStyle]}>
            {editingMessage && (
              <>
                <PenLine color={'#c96442'} />
                <Text style={{color: 'white', width: '80%'}} numberOfLines={1}>
                  {editingMessage.text}
                </Text>
                <TouchableNativeFeedback
                  onPress={() => {
                    setEditingMessage(null);
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
                  {editingMessage ? (
                    <CheckLine color={'white'} />
                  ) : (
                    <Send color={'white'} />
                  )}
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
