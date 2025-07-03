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
  Platform,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import React, {useEffect, useRef, useState, useMemo, useCallback} from 'react';
import Message from './components/message';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Header from './components/chatHeader';
import WebsocketService from './lib/WebsocketService';
import {useDispatch, useSelector} from 'react-redux';
import {addChat, setMessages, setMessagesIfNotExists} from './state/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const formatMessageDate = timestamp => {
  const messageDate =
    typeof timestamp === 'string'
      ? parseISO(timestamp)
      : new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const messageDateOnly = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate(),
  );
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const yesterdayOnly = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate(),
  );

  if (messageDateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  } else if (messageDateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else {
    return messageDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });
  }
};

const processMessagesWithDates = messages => {
  if (!messages || messages.length === 0) return [];

  const processedMessages = [];
  let lastDate = null;

  messages.forEach((message, index) => {
    const messageDate = new Date(message.time * 1000);
    const currentDateString = messageDate.toDateString();

    if (lastDate !== currentDateString) {
      processedMessages.push({
        type: 'date_separator',
        id: `date_${currentDateString}`,
        date: formatMessageDate(message.time),
        timestamp: messageDate,
        originalIndex: index,
      });
      lastDate = currentDateString;
    }

    processedMessages.push({
      ...message,
      type: 'message',
      messageDate: formatMessageDate(message.time),
      originalIndex: index,
    });
  });

  return processedMessages;
};

const findTopVisibleMessageWithBinarySearch = (
  processedMessages,
  messageLayouts,
  targetY,
) => {
  if (!processedMessages.length) return '';

  let left = 0;
  let right = processedMessages.length - 1;
  let result = null;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const item = processedMessages[mid];
    const itemId = item.id || mid;
    const layout = messageLayouts[itemId];

    if (!layout) {
      break;
    }

    if (layout.y <= targetY && layout.y + layout.height > targetY) {
      result = item;
      break;
    } else if (layout.y > targetY) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  if (result) {
    return result.type === 'message' ? result.messageDate : result.date;
  }

  const firstMessage = processedMessages.find(item => item.type === 'message');
  return firstMessage ? firstMessage.messageDate : '';
};

const DateSeparator = React.memo(({date}) => (
  <View style={styles.dateSeparator}>
    <View style={styles.dateSeparatorLine} />
    <Text style={styles.dateSeparatorText}>{date}</Text>
    <View style={styles.dateSeparatorLine} />
  </View>
));

const StickyDateHeader = React.memo(({currentDate, isVisible}) => {
  const translateY = useSharedValue(isVisible ? 0 : -50);
  const opacity = useSharedValue(isVisible ? 1 : 0);

  useEffect(() => {
    translateY.value = withTiming(isVisible ? 0 : -50, {duration: 200});
    opacity.value = withTiming(isVisible ? 1 : 0, {duration: 200});
  }, [isVisible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{translateY: translateY.value}],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.stickyDateHeader, animatedStyle]}>
      <Text style={styles.stickyDateText}>{currentDate}</Text>
    </Animated.View>
  );
});

const Chat = ({route, navigation}) => {
  const chats = useSelector(state => state.chats);
  const user = useSelector(state => state.user);
  const settings = useSelector(state => state.settings);

  const [chat, setChat] = useState(null);
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [replyingTo, setReplyingTo] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [currentTopDate, setCurrentTopDate] = useState('');
  const [showStickyDate, setShowStickyDate] = useState(false);
  const [messageLayouts, setMessageLayouts] = useState({});

  const scrollRef = useRef(null);
  const stickyDateTimeoutRef = useRef(null);
  const lastScrollYRef = useRef(0);
  const showSend = useSharedValue(inputValue.length > 0);
  const replyBarHeight = useSharedValue(0);
  const editBarHeight = useSharedValue(0);
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();

  const chatId = useRef(route.params.chat?.id);
  const messages = chat?.messages || [];

  const processedMessages = useMemo(
    () => processMessagesWithDates(messages),
    [messages],
  );

  const throttledScrollHandler = useCallback(
    (() => {
      let timeoutId = null;
      return event => {
        const {contentOffset} = event.nativeEvent;
        const currentScrollY = contentOffset.y;

        if (Math.abs(currentScrollY - lastScrollYRef.current) < 10) {
          return;
        }
        lastScrollYRef.current = currentScrollY;

        // Handle load more messages
        if (currentScrollY === 0 && chat?.hasMore) {
          let dataToSend = {
            action: 'get_messages',
            data: {chat_id: chat.id, last_message: chat.messages[0].id},
          };
          WebsocketService.send(dataToSend);
        }

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          const headerHeight = 120;
          const targetY = currentScrollY + headerHeight + 50;

          const topDate = findTopVisibleMessageWithBinarySearch(
            processedMessages,
            messageLayouts,
            targetY,
          );

          if (topDate && topDate !== currentTopDate) {
            setCurrentTopDate(topDate);
            setShowStickyDate(true);
          }
        }, 50);
      };
    })(),
    [
      processedMessages,
      messageLayouts,
      currentTopDate,
      chat?.hasMore,
      chat?.id,
      chat?.messages,
    ],
  );

  const onMessageLayout = useCallback(
    (() => {
      let timeoutId = null;
      const pendingUpdates = {};

      return (event, itemId) => {
        const {layout} = event.nativeEvent;
        pendingUpdates[itemId] = layout;

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          setMessageLayouts(prev => ({
            ...prev,
            ...pendingUpdates,
          }));
          Object.keys(pendingUpdates).forEach(
            key => delete pendingUpdates[key],
          );
        }, 16);
      };
    })(),
    [],
  );

  useEffect(() => {
    return () => {
      if (stickyDateTimeoutRef.current) {
        clearTimeout(stickyDateTimeoutRef.current);
      }
    };
  }, []);

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
          dispatch({type: 'SET_SETTINGS', payload: JSON.parse(savedSettings)});
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (chat && !chat.messages) {
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
    scrollRef.current?.scrollToEnd({animated: true});
  }, [chat?.messages]);

  const handleResponse = useCallback(
    data => {
      if (data.action == 'get_messages') {
        if (!chat) {
          dispatch(addChat(data.data.chat));
        }
        chatId.current = data.data.chat.id;
        const messages = data.data.results.map(message => ({
          ...message,
          is_mine: message.sender === user.id,
        }));
        dispatch(
          setMessagesIfNotExists(messages, chatId.current, data.data.has_more),
        );
      }
    },
    [chat, dispatch, user.id],
  );

  const sendMessage = useCallback(() => {
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
  }, [editingMessage, inputValue, chat?.id, replyingTo]);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
        scrollRef.current?.scrollToEnd({animated: true});
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
    const unreadMessages = messages.filter(
      message => message.status != 'read' && !message.is_mine,
    );
    if (unreadMessages.length > 0) {
      const message_ids = unreadMessages.map(message => message.id);
      const data = {
        action: 'read_message',
        data: {
          message_ids: message_ids,
          chat_id: chat.id,
        },
      };
      WebsocketService.send(data);
    }
  }, [messages]);

  const renderMessage = useCallback(
    (item, index) => {
      const itemId = item.id || index;

      if (item.type === 'date_separator') {
        return (
          <View key={itemId} onLayout={event => onMessageLayout(event, itemId)}>
            <DateSeparator date={item.date} />
          </View>
        );
      } else {
        return (
          <View key={itemId} onLayout={event => onMessageLayout(event, itemId)}>
            <Message
              message={item}
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
          </View>
        );
      }
    },
    [
      onMessageLayout,
      settings.myBubbleColor,
      settings.otherBubbleColor,
      settings.fontSize,
    ],
  );

  return (
    <View style={{flex: 1}}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={isKeyboardVisible ? 0 : -50}>
        <Header top={insets.top} navigation={navigation} chat={chat} />

        <StickyDateHeader
          currentDate={currentTopDate}
          isVisible={showStickyDate}
        />

        <ImageBackground
          style={{flex: 1, backgroundColor: '#141516'}}
          source={{uri: settings.backgroundImage}}>
          <ScrollView
            style={styles.chatContainer}
            ref={scrollRef}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            onScroll={throttledScrollHandler}
            scrollEventThrottle={32}
            contentContainerStyle={{
              flexGrow: 1,
              justifyContent: 'flex-end',
              paddingBottom: 10,
              paddingTop: 120,
            }}>
            {processedMessages.map(renderMessage)}
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
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    borderTopColor: 'grey',
    borderTopWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    flexDirection: 'row',
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
  },
  dateSeparatorText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 15,
    backgroundColor: 'rgba(32, 35, 36, 0.8)',
    borderRadius: 12,
    paddingVertical: 4,
  },
  stickyDateHeader: {
    position: 'absolute',
    top: 130,
    left: 0,
    right: 0,
    zIndex: 1000,
    alignItems: 'center',
    paddingVertical: 8,
  },
  stickyDateText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    backgroundColor: 'rgba(32, 35, 36, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    overflow: 'hidden',
  },
});

export default Chat;
