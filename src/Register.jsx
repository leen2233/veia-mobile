import {Lock, Mail, User} from 'lucide-react-native';
import {useEffect, useState} from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  TouchableNativeFeedback,
  View,
} from 'react-native';

import {useSelector} from 'react-redux';
import WebsocketService from './lib/WebsocketService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterPage = ({navigation}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState();
  const isConnecting = useSelector(state => state.connectionStatus.state);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
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
    if (data.action == 'sign_up') {
      if (data.success) {
        AsyncStorage.setItem('accessToken', data.data.access);
        AsyncStorage.setItem('refreshToken', data.data.refresh);
        WebsocketService.removeListener(handleResponse);
        navigation.navigate('Home');
      } else {
        setErrors(data.data);
      }
    }
  };

  const submitRegister = () => {
    let data = {
      action: 'sign_up',
      data: {username: username, password: password, email: email},
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
      <Text style={styles.subtitle}>Join by creating account</Text>
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
            placeholder="Choose a username"
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
            {color: errors.email ? '#c14646' : 'white'},
          ]}>
          {errors.email ? '* ' + errors.email : 'Email'}
        </Text>
        <View style={styles.input}>
          <Mail width={20} color={'#898f99'} style={{marginHorizontal: 2}} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your email"
            placeholderTextColor={'#898f99'}
            value={email}
            onChangeText={text => {
              setEmail(text);
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
            placeholder="Create a password"
            placeholderTextColor={'#898f99'}
            value={password}
            onChangeText={text => {
              setPassword(text);
            }}
          />
        </View>
      </View>
      <TouchableNativeFeedback disabled={isConnecting} onPress={submitRegister}>
        <View
          style={[
            styles.submitButton,
            {backgroundColor: isConnecting ? '#c96444' : '#c96442'},
          ]}>
          <Text style={{color: 'white', fontSize: 17, letterSpacing: 0.6}}>
            {isConnecting ? 'Connecting... ' : 'Register'}
          </Text>
        </View>
      </TouchableNativeFeedback>
      <Text style={{color: '#898f99', marginTop: 10}}>
        Already have an account?{'  '}
        <Text
          style={{color: '#c96442'}}
          onPress={() => {
            navigation.navigate('Login');
          }}>
          Login
        </Text>
      </Text>
    </KeyboardAvoidingView>
  );
};

export default RegisterPage;

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
