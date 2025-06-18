import {Lock, User} from 'lucide-react-native';
import {useEffect, useState} from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  Touchable,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import {useSelector} from 'react-redux';
import WebsocketService from './lib/WebsocketService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginPage = ({navigation}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState();
  const isConnecting = useSelector(state => state.connectionStatus.state);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setIsKeyboardVisible(false),
    );

    WebsocketService.addListener(handleResponse);

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleResponse = data => {
    if (data.action == 'login') {
      if (data.success) {
        accessToken = data.data.access;
        refreshToken = data.data.refresh;
        AsyncStorage.setItem('accessToken', accessToken);
        AsyncStorage.setItem('refreshToken', refreshToken);
        WebsocketService.removeListener(handleResponse);
        navigation.navigate('Home');
      } else {
        setErrors(data.data);
      }
    }
  };

  const submitLogin = () => {
    data = {
      action: 'login',
      data: {username: username, password: password},
    };
    WebsocketService.send(data);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={isKeyboardVisible ? 0 : -50}>
      <Image source={require('./assets/logo.png')} style={styles.logoImage} />
      <Text style={styles.title}>Veia</Text>
      <Text style={styles.subtitle}>Welcome back! Please sign in</Text>
      {errors.message && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>{errors.message}</Text>
        </View>
      )}
      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputTitle,
            {color: errors.username ? '#c14646' : 'white'},
          ]}>
          {errors.username ? '* ' + errors.username : 'Username'}
        </Text>
        <View style={styles.input}>
          <User color={'#898f99'} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your username"
            placeholderTextColor={'#898f99'}
            value={username}
            onChangeText={text => {
              setUsername(text);
            }}
          />
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text
          style={[
            styles.inputTitle,
            {color: errors.password ? '#c14646' : 'white'},
          ]}>
          {errors.password ? '* ' + errors.password : 'Password'}
        </Text>
        <View style={styles.input}>
          <Lock width={20} color={'#898f99'} style={{marginHorizontal: 2}} />
          <TextInput
            style={styles.textInput}
            secureTextEntry={true}
            placeholder="Enter your password"
            placeholderTextColor={'#898f99'}
            value={password}
            onChangeText={text => {
              setPassword(text);
            }}
          />
        </View>
      </View>
      <TouchableNativeFeedback disabled={isConnecting} onPress={submitLogin}>
        <View
          style={[
            styles.submitButton,
            {backgroundColor: isConnecting ? '#c96444' : '#c96442'},
          ]}>
          <Text style={{color: 'white', fontSize: 17, letterSpacing: 0.6}}>
            {isConnecting ? 'Connecting... ' : 'Login'}
          </Text>
        </View>
      </TouchableNativeFeedback>
      <Text style={{color: '#898f99', marginTop: 10}}>
        Don't have an account?{' '}
        <Text
          style={{color: '#c96442'}}
          onPress={() => {
            navigation.navigate('Register');
          }}>
          Register
        </Text>
      </Text>
    </KeyboardAvoidingView>
  );
};

export default LoginPage;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141516',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoImage: {
    width: 90,
    height: 70,
  },
  title: {
    color: 'white',
    fontSize: 30,
    fontWeight: 600,
    letterSpacing: 3,
  },
  subtitle: {
    color: '#828892',
    fontSize: 16,
    marginBottom: 40,
  },
  inputGroup: {
    width: '100%',
    paddingHorizontal: 40,
    paddingVertical: 6,
  },
  inputTitle: {
    color: 'white',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    backgroundColor: '#2a2b2c',
    borderWidth: 0.5,
    borderColor: '#2f2f2f',
    borderRadius: 30,
    height: 50,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 15,
    gap: 10,
  },
  textInput: {
    color: 'white',
    flex: 1,
    fontSize: 15,
  },
  submitButton: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    backgroundColor: '#c96442',
    borderRadius: 30,
    marginTop: 10,
  },
  errorContainer: {
    borderWidth: 1,
    borderColor: '#c14646',
    width: '80%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginBottom: 10,
  },
  errorMessage: {
    color: '#c14646',
  },
});
