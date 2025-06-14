import React, {useState, useEffect} from 'react';
import {parseISO, differenceInMinutes, format, isSameDay} from 'date-fns';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CheckCheck, ChevronLeft} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ColorPicker from 'react-native-wheel-color-picker'; // You'll need to install this or a similar library

const SETTINGS_KEY = '@chat_settings';

const Message = ({message, myMessageColor, otherMessageColor, fontSize}) => {
  const messageStyle = message.is_mine ? styles.myMessage : styles.otherMessage;

  function formatTimestamp(timestamp) {
    const date =
      typeof timestamp === 'string'
        ? parseISO(timestamp)
        : new Date(timestamp < 1e12 ? timestamp * 1000 : timestamp);
    const now = new Date();
    const diffInMinutes = differenceInMinutes(now, date);
    if (diffInMinutes < 60 && isSameDay(now, date)) {
      return `${diffInMinutes} min ago`;
    }
    return format(date, 'HH:mm');
  }
  const formattedTime = formatTimestamp(message.time);

  return (
    <View style={{width: '100%'}}>
      <View
        style={[
          styles.messageContainer,
          messageStyle,
          {
            backgroundColor: message.is_mine
              ? myMessageColor
              : otherMessageColor,
          },
        ]}>
        <View style={styles.contentContainer}>
          <View style={styles.messageWrapper}>
            <Text style={[styles.messageText, {fontSize: fontSize}]}>
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
                  fontSize: fontSize - 2,
                }}>
                {formattedTime}
              </Text>
              {message.is_mine &&
                (message.status === 'sent' ? (
                  <Check size={fontSize + 2} color={'white'} />
                ) : (
                  message.status === 'read' && (
                    <CheckCheck
                      size={fontSize + 2}
                      color={'white'}
                      style={{backgroundColor: 'transparent'}}
                    />
                  )
                ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const UISettings = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const [backgroundColor, setBackgroundColor] = useState('#141516');
  const [myBubbleColor, setMyBubbleColor] = useState('#c96442');
  const [otherBubbleColor, setOtherBubbleColor] = useState('#202324');
  const [fontSize, setFontSize] = useState(16);
  const [showColorPicker, setShowColorPicker] = useState(null);
  // Sample Messages for Preview
  const [sampleMyMessage, setSampleMyMessage] = useState({
    text: 'This is my message.',
    is_mine: true,
    time: new Date().toISOString(),
    status: 'read',
  });
  const [sampleOtherMessage, setSampleOtherMessage] = useState({
    text: "This is the other person's message.",
    is_mine: false,
    time: new Date().toISOString(),
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setBackgroundColor(parsedSettings.backgroundColor || '#141516');
        setMyBubbleColor(parsedSettings.myBubbleColor || '#c96442');
        setOtherBubbleColor(parsedSettings.otherBubbleColor || '#202324');
        setFontSize(parsedSettings.fontSize || 16);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settingsToSave = JSON.stringify({
        backgroundColor,
        myBubbleColor,
        otherBubbleColor,
        fontSize,
      });
      await AsyncStorage.setItem(SETTINGS_KEY, settingsToSave);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  useEffect(() => {
    saveSettings();
  }, [backgroundColor, myBubbleColor, otherBubbleColor, fontSize]);

  const renderColorPicker = (settingType, currentColor, setColor) => {
    if (showColorPicker === settingType) {
      return (
        <View style={styles.colorPickerContainer}>
          <ColorPicker
            onColorChange={color => setColor(color)}
            color={currentColor}
            thumbSize={30}
            sliderSize={30}
            noSnap={true}
            row={false}
            swatchesLast={false}
            swatches={false}
            shadeWheelThumb={false}
            row={true}
            // sliderHidden={true}
          />
          <TouchableOpacity
            onPress={() => setShowColorPicker(null)}
            style={styles.closeColorPickerButton}>
            <Text style={styles.closeColorPickerText}>Done</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat Settings</Text>
        <View style={{width: 24}} />
      </View>
      <ScrollView contentContainerStyle={styles.settingsContent}>
        {/* Sample Messages */}
        <Text style={styles.sectionTitle}>Preview</Text>
        <View
          style={[
            styles.previewMessageContainer,
            {backgroundColor: backgroundColor},
          ]}>
          <Message
            message={sampleMyMessage}
            myMessageColor={myBubbleColor}
            otherMessageColor={otherBubbleColor}
            fontSize={fontSize}
            onReply={() => {}}
          />
          <Message
            message={sampleOtherMessage}
            myMessageColor={myBubbleColor}
            otherMessageColor={otherBubbleColor}
            fontSize={fontSize}
            onReply={() => {}}
          />
        </View>

        <Text style={styles.sectionTitle}>Appearance</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() =>
            setShowColorPicker(
              showColorPicker === 'background' ? null : 'background',
            )
          }>
          <Text style={styles.settingText}>Background Color</Text>
          <View
            style={[styles.colorPreview, {backgroundColor: backgroundColor}]}
          />
        </TouchableOpacity>
        {renderColorPicker('background', backgroundColor, setBackgroundColor)}

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() =>
            setShowColorPicker(
              showColorPicker === 'myBubble' ? null : 'myBubble',
            )
          }>
          <Text style={styles.settingText}>My Message Bubble Color</Text>
          <View
            style={[styles.colorPreview, {backgroundColor: myBubbleColor}]}
          />
        </TouchableOpacity>
        {renderColorPicker('myBubble', myBubbleColor, setMyBubbleColor)}

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() =>
            setShowColorPicker(
              showColorPicker === 'otherBubble' ? null : 'otherBubble',
            )
          }>
          <Text style={styles.settingText}>Other Message Bubble Color</Text>
          <View
            style={[styles.colorPreview, {backgroundColor: otherBubbleColor}]}
          />
        </TouchableOpacity>
        {renderColorPicker(
          'otherBubble',
          otherBubbleColor,
          setOtherBubbleColor,
        )}

        <Text style={styles.sectionTitle}>Text Settings</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Font Size</Text>
          <Text style={styles.settingValue}>{fontSize} px</Text>
        </View>
        <Slider
          style={{width: '90%', alignSelf: 'center', marginTop: 10}}
          minimumValue={10}
          maximumValue={26}
          step={1}
          value={fontSize}
          onValueChange={value => setFontSize(value)}
          minimumTrackTintColor="#c96442"
          maximumTrackTintColor="#aaa"
          thumbTintColor="#c96442"
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    height: 60,
    backgroundColor: '#202324',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  settingsContent: {
    padding: 20,
  },
  sectionTitle: {
    color: '#ccc',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  settingText: {
    color: 'white',
    fontSize: 16,
  },
  settingValue: {
    color: '#ccc',
    fontSize: 16,
  },
  colorPreview: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#555',
  },
  colorPickerContainer: {
    height: 300,
    width: '100%',
    backgroundColor: '#2b2b2b',
    borderRadius: 10,
    marginTop: 10,
    padding: 10,
  },
  closeColorPickerButton: {
    marginTop: 10,
    backgroundColor: '#c96442',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeColorPickerText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewMessageContainer: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'grey',
    paddingVertical: 20,
  },
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
});

export default UISettings;
