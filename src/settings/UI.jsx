import React, {useState, useEffect} from 'react';
import {parseISO, differenceInMinutes, format, isSameDay} from 'date-fns';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableNativeFeedback,
  Platform,
  PermissionsAndroid,
  ImageBackground,
  Modal,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  ArrowDown,
  ArrowRight,
  CaseSensitive,
  CheckCheck,
  ChevronLeft,
  Image as ImageIcon,
  ImageOff,
  ImagePlus,
  ImageUpscale,
  Paintbrush,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ColorPicker from 'react-native-wheel-color-picker'; // You'll need to install this or a similar library
import ImageCropPicker from 'react-native-image-crop-picker';

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
              <Text
                style={[styles.timestampPlaceholder, {fontSize: fontSize - 2}]}>
                {' '}
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
  const [openedSection, setOpenedSection] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(null);
  const [isImageViewerVisible, setImageViewerVisible] = useState(false);
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
      const storedSettings = await AsyncStorage.getItem('chat_settings');
      if (storedSettings) {
        const parsedSettings = JSON.parse(storedSettings);
        setBackgroundColor(parsedSettings.backgroundColor || '#141516');
        setMyBubbleColor(parsedSettings.myBubbleColor || '#c96442');
        setOtherBubbleColor(parsedSettings.otherBubbleColor || '#202324');
        setFontSize(parsedSettings.fontSize || 16);
        setBackgroundImage(parsedSettings.backgroundImage || null);
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
        backgroundImage,
      });
      await AsyncStorage.setItem('chat_settings', settingsToSave);
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleImageSelection = async () => {
    try {
      // Request permissions first
      const hasPermission = await requestStoragePermissions();
      if (!hasPermission) {
        alert('Storage permission denied');
        return;
      }

      let result;
      let croppedImage;
      const cropperOptions = {
        width: 400,
        height: 800,
        cropping: true,
        mediaType: 'photo',
        compressImageQuality: 0.8,
        forceJpg: true, // Force JPEG format
        includeBase64: true, // Include base64 data
        cropperToolbarTitle: 'Crop Chat Background',
        cropperToolbarColor: '#2a2e31',
        cropperStatusBarColor: '#2a2e31',
        cropperToolbarWidgetColor: '#ffffff',
        cropperActiveWidgetColor: '#c96442',
        cropperTintColor: '#c96442',
        loadingLabelText: 'Processing...',
        enableRotationGesture: true,
      };

      result = await ImageCropPicker.openPicker({
        mediaType: 'photo',
        cropping: false,
      });
      croppedImage = await ImageCropPicker.openCropper({
        ...cropperOptions,
        path: result.path,
      });
      console.log('cropped', croppedImage);

      if (result) {
        console.log(result, 'result');

        setBackgroundImage(croppedImage.path);
      }
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        console.error('Error picking image:', error);
        alert('Failed to process the image. Please try another one.');
      }
    }
  };

  const requestStoragePermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const permissions = [PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES];

        const results = await PermissionsAndroid.requestMultiple(permissions);

        return Object.values(results).every(
          result => result === PermissionsAndroid.RESULTS.GRANTED,
        );
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    } else if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'Veia needs access to your storage to select photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Permission error:', err);
        return false;
      }
    }
    return true; // iOS handled by Info.plist
  };

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
        <Text style={[styles.sectionTitle, {marginVertical: 20}]}>Preview</Text>
        {backgroundImage ? (
          <ImageBackground
            source={{uri: backgroundImage}}
            style={styles.previewBackgroundImage}
            resizeMode="cover">
            <View style={styles.previewOverlay}>
              <Message
                message={sampleOtherMessage}
                myMessageColor={myBubbleColor}
                otherMessageColor={otherBubbleColor}
                fontSize={fontSize}
              />
              <Message
                message={sampleMyMessage}
                myMessageColor={myBubbleColor}
                otherBubbleColor={otherBubbleColor}
                fontSize={fontSize}
              />
            </View>
          </ImageBackground>
        ) : (
          <View
            style={[
              styles.previewColorBackground,
              {backgroundColor: backgroundColor},
            ]}>
            <Message
              message={sampleOtherMessage}
              myMessageColor={myBubbleColor}
              otherMessageColor={otherBubbleColor}
              fontSize={fontSize}
            />
            <Message
              message={sampleMyMessage}
              myMessageColor={myBubbleColor}
              otherMessageColor={otherBubbleColor}
              fontSize={fontSize}
            />
          </View>
        )}

        <TouchableOpacity
          onPress={() =>
            setOpenedSection(
              openedSection === 'background' ? null : 'background',
            )
          }
          style={styles.sectionOpenButton}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <ImageIcon color={'#ababab'} />
            <Text style={styles.sectionTitle}>Background</Text>
          </View>
          {openedSection === 'background' ? (
            <ArrowDown color={'white'} size={22} />
          ) : (
            <ArrowRight color={'white'} size={22} />
          )}
        </TouchableOpacity>

        {openedSection === 'background' && (
          <View>
            {backgroundImage && (
              <TouchableNativeFeedback
                onPress={() => {
                  setImageViewerVisible(true);
                  console.log(backgroundImage);
                }}>
                <View style={styles.nestedButton}>
                  <ImageUpscale size={18} color={'#c96442'} />
                  <Text style={styles.nestedButtonText}>
                    View current Image
                  </Text>
                </View>
              </TouchableNativeFeedback>
            )}
            {backgroundImage && (
              <TouchableNativeFeedback
                onPress={() => {
                  setBackgroundImage(null);
                }}>
                <View style={styles.nestedButton}>
                  <ImageOff size={18} color={'#c96442'} />
                  <Text style={styles.nestedButtonText}>
                    Clear current Image
                  </Text>
                </View>
              </TouchableNativeFeedback>
            )}
            <TouchableNativeFeedback onPress={handleImageSelection}>
              <View style={styles.nestedButton}>
                <ImagePlus size={18} color={'#c96442'} />
                <Text style={styles.nestedButtonText}>
                  Select background image
                </Text>
              </View>
            </TouchableNativeFeedback>
          </View>
        )}

        <TouchableOpacity
          onPress={() =>
            setOpenedSection(openedSection === 'colors' ? null : 'colors')
          }
          style={styles.sectionOpenButton}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <Paintbrush color={'#ababab'} />
            <Text style={styles.sectionTitle}>Colors</Text>
          </View>
          {openedSection === 'colors' ? (
            <ArrowDown color={'white'} size={22} />
          ) : (
            <ArrowRight color={'white'} size={22} />
          )}
        </TouchableOpacity>

        {openedSection === 'colors' && (
          <View>
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
                style={[
                  styles.colorPreview,
                  {backgroundColor: otherBubbleColor},
                ]}
              />
            </TouchableOpacity>
            {renderColorPicker(
              'otherBubble',
              otherBubbleColor,
              setOtherBubbleColor,
            )}
          </View>
        )}

        <TouchableOpacity
          onPress={() =>
            setOpenedSection(openedSection === 'font' ? null : 'font')
          }
          style={styles.sectionOpenButton}>
          <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
            <CaseSensitive color={'#ababab'} />
            <Text style={styles.sectionTitle}>Font</Text>
          </View>
          {openedSection === 'font' ? (
            <ArrowDown color={'white'} size={22} />
          ) : (
            <ArrowRight color={'white'} size={22} />
          )}
        </TouchableOpacity>
        {openedSection === 'font' && (
          <View style={{width: '90%', alignSelf: 'center', marginTop: 10}}>
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
          </View>
        )}
      </ScrollView>
      <TouchableOpacity style={styles.saveButton} onPress={saveSettings}>
        <Text style={styles.closeColorPickerText}>Save Changes</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={isImageViewerVisible}
        onRequestClose={() => setImageViewerVisible(false)}>
        <View style={styles.imageViewerModal}>
          <TouchableOpacity
            style={styles.imageViewerBackdrop}
            activeOpacity={1}
            onPressOut={() => setImageViewerVisible(false)}
          />
          <Image
            source={{uri: backgroundImage}}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
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
    borderRadius: 10,
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
  saveButton: {
    height: 50,
    backgroundColor: '#c96442',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    width: '80%',
    margin: 'auto',
    borderRadius: 15,
  },
  sectionOpenButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  nestedButton: {
    marginLeft: 30,
    flexDirection: 'row',
    gap: 10,
    padding: 10,
  },
  nestedButtonText: {
    color: '#c96442',
    fontSize: 14,
  },
  previewBackgroundImage: {
    paddingVertical: 20,
  },
  previewColorBackground: {
    paddingVertical: 20,
  },
  imageViewerModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  imageViewerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  fullScreenImage: {
    width: '90%',
    height: '90%',
  },
});

export default UISettings;
