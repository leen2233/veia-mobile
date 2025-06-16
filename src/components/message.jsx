import React from 'react';
import {parseISO, differenceInMinutes, format, isSameDay} from 'date-fns';
import {StyleSheet, Text, View} from 'react-native';
import {Check, CheckCheck, Reply} from 'lucide-react-native';
import 'react-native-gesture-handler';

import Animated, {
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

const lightenColor = (hex, percent) => {
  let f = parseInt(hex.slice(1), 16),
    t = percent < 0 ? 0 : 255,
    p = percent < 0 ? percent * -1 : percent,
    R = f >> 16,
    G = (f >> 8) & 0x00ff,
    B = f & 0x0000ff;
  return (
    '#' +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
};

const Message = ({
  message,
  onReply,
  myBubbleColor = '#c96442',
  otherBubbleColor = '#202324',
  fontSize,
}) => {
  const messageStyle = message.is_mine ? styles.myMessage : styles.otherMessage;
  const repliedStyle = message.is_mine
    ? styles.repliedMineStyle
    : styles.repliedStyle;
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
      typeof timestamp === 'string'
        ? parseISO(timestamp)
        : new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, date);
    if (diffInMinutes < 60 && isSameDay(now, date)) {
      if (diffInMinutes < 1) {
        return 'Just now';
      }
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

  const formattedTime = formatTimestamp(message.time);
  console.log(myBubbleColor);

  return (
    <GestureDetector gesture={pan}>
      <View style={{width: '100%'}}>
        <Animated.View
          style={[
            styles.messageContainer,
            messageStyle,
            animatedStyles,
            {
              backgroundColor: message.is_mine
                ? myBubbleColor
                : otherBubbleColor,
            },
          ]}>
          <View style={styles.contentContainer}>
            <View style={styles.messageWrapper}>
              {message.reply_to && (
                <View
                  style={[
                    repliedStyle,
                    {
                      backgroundColor: message.is_mine
                        ? lightenColor(myBubbleColor, 0.2)
                        : lightenColor(otherBubbleColor, 0.2),
                      borderLeftColor: message.is_mine
                        ? lightenColor(myBubbleColor, -0.2)
                        : lightenColor(otherBubbleColor, -0.2),
                    },
                  ]}>
                  <Text style={{color: 'white', fontSize: fontSize - 2}}>
                    {message.reply_to.text}
                  </Text>
                </View>
              )}
              <Text style={[styles.messageText, {fontSize: fontSize}]}>
                {message.text}
                <Text
                  style={[
                    styles.timestampPlaceholder,
                    {fontSize: fontSize - 2},
                  ]}>
                  {'  '}
                  {formattedTime}{' '}
                  {message.status === 'sent' ? (
                    <Check color={'transparent'} size={fontSize + 2} />
                  ) : (
                    message.status === 'read' && (
                      <CheckCheck color={'transparent'} size={fontSize + 2} />
                    )
                  )}
                </Text>
              </Text>
              <View style={styles.timestampOverlay}>
                <Text
                  style={{
                    color: '#CCCCCC',
                    fontSize: fontSize - 2,
                  }}>
                  {formattedTime}{' '}
                </Text>
                {message.is_mine &&
                  (message.status === 'sent' ? (
                    <Check size={fontSize} color={'white'} />
                  ) : (
                    message.status === 'read' && (
                      <CheckCheck
                        size={fontSize}
                        color={'white'}
                        style={{backgroundColor: 'transparent'}}
                      />
                    )
                  ))}
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
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  contentContainer: {
    padding: 10,
    paddingHorizontal: 15,
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
  repliedMineStyle: {
    paddingHorizontal: 10,
    minHeight: 30,
    marginBottom: 6,
    justifyContent: 'center',
    borderRadius: 10,
    borderLeftColor: '#e85827',
    borderLeftWidth: 5,
  },
  repliedStyle: {
    paddingHorizontal: 10,
    minHeight: 30,
    marginBottom: 6,
    justifyContent: 'center',
    borderRadius: 10,
    borderLeftColor: '#1a1a1a',
    borderLeftWidth: 5,
  },
});
