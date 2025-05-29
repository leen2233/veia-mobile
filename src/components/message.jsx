import React from 'react';
import {parseISO, differenceInMinutes, format} from 'date-fns';
import {StyleSheet, Text, View} from 'react-native';
import {Check, CheckCheck, Reply} from 'lucide-react-native';
import 'react-native-gesture-handler';

import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';

const Message = ({message, onReply}) => {
  const isMe = message.sender === 'me';
  const messageStyle = isMe ? styles.myMessage : styles.otherMessage;
  const offset = useSharedValue(0);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 100])
    .failOffsetY([-5, 5])
    .onBegin(() => {})
    .onChange(event => {
      if (event.translationX < 0) {
        offset.value = Math.max(event.translationX, -80);
      }
    })
    .onFinalize(event => {
      if (event.translationX < -40) {
        runOnJS(onReply)(message);
      }

      offset.value = withSpring(0);
    })
    .simultaneousWithExternalGesture(true);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{translateX: offset.value}],
  }));

  function formatTimestamp(timestamp) {
    const date =
      typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, date);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }
    return format(date, 'HH:mm');
  }

  const replyIconStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      offset.value,
      [0, -20, -90],
      [0, 0, 1],
      'clamp',
    );

    const scale = interpolate(
      offset.value,
      [0, -40, -80],
      [0.5, 1.2, 1],
      'clamp',
    );

    return {
      opacity,
      transform: [{scale}],
    };
  });

  const formattedTime = formatTimestamp(message.timestamp);

  return (
    <GestureDetector gesture={pan}>
      <View style={{width: '100%'}}>
        <Animated.View
          style={[styles.messageContainer, messageStyle, animatedStyles]}>
          <View style={styles.contentContainer}>
            <View style={styles.messageWrapper}>
              <Text style={styles.messageText}>
                {message.text}
                <Text style={[styles.timestampPlaceholder]}>
                  {formattedTime}
                  {message.status === 'sent' ? (
                    <Check color={'transparent'} size={18} />
                  ) : (
                    message.status === 'read' && (
                      <CheckCheck color={'transparent'} size={18} />
                    )
                  )}
                </Text>
              </Text>
              <View style={styles.timestampOverlay}>
                <Text
                  style={{
                    color: '#CCCCCC',
                    fontSize: 12,
                  }}>
                  {formattedTime}
                </Text>
                {message.status === 'sent' ? (
                  <Check size={18} color={'white'} />
                ) : (
                  message.status === 'read' && (
                    <CheckCheck
                      size={18}
                      color={'white'}
                      style={{backgroundColor: 'transparent'}}
                    />
                  )
                )}
              </View>
            </View>
          </View>
        </Animated.View>
        <Animated.View style={[styles.replyIconContainer, replyIconStyle]}>
          <Reply size={18} color="white" />
        </Animated.View>
      </View>
    </GestureDetector>
  );
};

export default Message;

const styles = StyleSheet.create({
  messageContainer: {
    borderRadius: 20,
    marginVertical: 5,
    maxWidth: '80%',
    marginHorizontal: 10,
    minHeight: 20,
  },
  myMessage: {
    backgroundColor: '#c96442',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#202324',
    alignSelf: 'flex-start',
  },
  contentContainer: {
    padding: 10,
  },
  messageWrapper: {
    position: 'relative',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  timestampPlaceholder: {
    color: 'transparent',
    flexDirection: 'row',
    paddingLeft: 5,
  },
  timestampOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyIconContainer: {
    position: 'absolute',
    right: 20,
    zIndex: 1,
    top: '30%',
    backgroundColor: '#c96442',
    borderRadius: 20,
    width: 25,
    height: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
