import {StyleSheet, Text, View} from 'react-native';

const Message = ({text, time, sender}) => {
  const isMe = sender === 'me';
  const messageStyle = isMe ? styles.myMessage : styles.otherMessage;
  const timeStyle = isMe ? styles.myTime : styles.otherTime;

  return (
    <View style={[styles.messageContainer, messageStyle]}>
      <Text style={[styles.messageText, timeStyle]}>{text}</Text>
    </View>
  );
};

export default Message;

const styles = StyleSheet.create({
  messageContainer: {
    borderRadius: 8,
    marginVertical: 5,
    maxWidth: '80%',
    marginHorizontal: 10,
  },
  myMessage: {
    backgroundColor: '#c96442',
    alignSelf: 'flex-end',
  },
  otherMessage: {
    backgroundColor: '#202324',
    alignSelf: 'flex-start',
  },
  messageText: {
    color: 'white',
    padding: 10,
    borderRadius: 20,
    maxWidth: '80%',
  },
});
