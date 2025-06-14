import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import ImageCropPicker from 'react-native-image-crop-picker';
import Avatar from './components/avatar';
import {Camera, Save, X, ArrowLeft} from 'lucide-react-native';
import {useDispatch, useSelector} from 'react-redux';
import WebsocketService from './lib/WebsocketService';
import {setUser} from './state/actions';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const EditProfile = ({navigation}) => {
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatar, setAvatar] = useState(user?.avatar);
  const [error, setError] = useState('');

  const insets = useSafeAreaInsets();

  useEffect(() => {
    WebsocketService.addListener(handleResponse);

    return () => {
      WebsocketService.removeListener(handleResponse);
    };
  }, []);

  const handleResponse = data => {
    if (data.action == 'update_user') {
      if (data.success) {
        dispatch(setUser(data.data.user));
        navigation.goBack();
      } else {
        setError(data.data.username);
      }
    }
  };

  const handleAvatarPress = () => {
    setShowImagePicker(true);
  };

  const handleImageSelection = async method => {
    setShowImagePicker(false);

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
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        mediaType: 'photo',
        compressImageQuality: 0.8,
        forceJpg: true, // Force JPEG format
        includeBase64: true, // Include base64 data
        cropperToolbarTitle: 'Crop Profile Picture',
        cropperToolbarColor: '#2a2e31',
        cropperStatusBarColor: '#2a2e31',
        cropperToolbarWidgetColor: '#ffffff',
        cropperActiveWidgetColor: '#c96442',
        cropperTintColor: '#c96442',
        loadingLabelText: 'Processing...',
        enableRotationGesture: true,
      };

      if (method === 'camera') {
        const hasCameraPermission = await requestCameraPermission();
        if (!hasCameraPermission) {
          alert('Camera permission denied');
          return;
        }
        result = await ImageCropPicker.openCamera({cropping: false});
        croppedImage = await ImageCropPicker.openCropper({
          ...cropperOptions,
          path: result.path,
        });
      } else {
        // result = await ImageCropPicker.openPicker(cropperOptions);
        result = await ImageCropPicker.openPicker({
          mediaType: 'photo',
          cropping: false,
        });
        croppedImage = await ImageCropPicker.openCropper({
          ...cropperOptions,
          path: result.path,
        });
        console.log('cropped', croppedImage);
      }

      if (result) {
        console.log(result, 'result');
        // Clean up previous image if it exists
        if (avatar?.startsWith('file://')) {
          ImageCropPicker.cleanSingle(avatar).catch(e =>
            console.log('Image cleanup error:', e),
          );
        }

        setAvatar(croppedImage.path);
      }
    } catch (error) {
      if (error.message !== 'User cancelled image selection') {
        console.error('Error picking image:', error);
        alert('Failed to process the image. Please try another one.');
      }
    }
  };

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message:
              'Flickture needs access to your camera to take profile photos',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.error('Camera permission err:', err);
        return false;
      }
    }
    return true; // iOS permissions are handled by info.plist
  };

  const requestStoragePermissions = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const permissions = [
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
          // PermissionsAndroid.PERMISSIONS.READ_MEDIA_DOWNLOADS,
        ];

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
            message: 'Flickture needs access to your storage to select photos',
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

  const handleSubmit = async () => {
    let url = null;
    console.log('submitting');
    if (avatar && avatar.startsWith('file://')) {
      const formData = new FormData();
      formData.append('file', {
        uri: avatar,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });

      try {
        console.log('uplaoading avatare');
        const response = await fetch('https://veia-api.leen2233.me/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          url = data.url;
          console.log('Upload successful, URL:', url);
        } else {
          console.error('Upload failed:', response.status, response.statusText);
        }
      } catch (error) {
        console.error('Upload error:', error);
      }
    }

    const updatedProfile = {
      full_name: fullName,
      username: username,
      bio: bio,
      avatar: url || avatar,
    };
    console.log('Profile update:', updatedProfile);
    const dataToSend = {action: 'update_user', data: updatedProfile};
    WebsocketService.send(dataToSend);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <ScrollView
      style={[styles.container, {paddingTop: insets.top}]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.headerSpace} />
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <Avatar url={avatar} name={user?.display_name} width={80} />
            <TouchableOpacity
              style={styles.avatarEditButton}
              onPress={handleAvatarPress}>
              <Camera size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.avatarLabel}>Tap to change avatar</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#666"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, error && {color: '#c14646'}]}>
              {error ? '* ' + error : 'Username'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor="#666"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Bio</Text>
            <TextInput
              style={[styles.textInput, styles.bioInput]}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor="#666"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleBack}>
            <X size={20} color="#666" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSubmit}>
            <Save size={20} color="white" />
            <Text style={styles.saveButtonText}>Save Changes</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Modal
        visible={showImagePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePicker(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowImagePicker(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={{color: 'white', fontSize: 20, fontWeight: 600}}>
                Choose Image Source
              </Text>
              <TouchableOpacity
                onPress={() => setShowImagePicker(false)}
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <Text
              style={styles.modalDescription}
              color="rgba(255, 255, 255, 0.7)">
              Select where you want to pick the image from
            </Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={() => handleImageSelection('camera')}>
                <Text style={styles.outlineButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.filledButton]}
                onPress={() => handleImageSelection('gallery')}>
                <Text style={styles.filledButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

export default EditProfile;

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#202324',
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpace: {
    width: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#c96442',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#202324',
  },
  avatarLabel: {
    fontSize: 14,
    color: '#ababab',
  },
  formContainer: {
    marginBottom: 10,
  },
  fieldContainer: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#2a2e31',
    borderRadius: 12,
    height: 50,
    padding: 16,
    fontSize: 16,
    color: 'white',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bioInput: {
    height: 100,
    paddingTop: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
    height: 50,
  },
  cancelButton: {
    backgroundColor: '#2a2e31',
    borderWidth: 1,
    borderColor: '#404040',
  },
  saveButton: {
    backgroundColor: '#c96442',
  },
  cancelButtonText: {
    color: '#ababab',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#2a2e31',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 24,
    fontWeight: '600',
  },
  modalDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 24,
    fontSize: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#ababab',
    backgroundColor: 'transparent',
  },
  filledButton: {
    backgroundColor: '#c96442',
  },
  outlineButtonText: {
    color: '#ababab',
    fontSize: 16,
    fontWeight: '600',
  },
  filledButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
};
