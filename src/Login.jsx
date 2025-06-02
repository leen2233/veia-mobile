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

const LoginPage = ({navigation}) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState();

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

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={isKeyboardVisible ? 0 : -50}>
      <Image source={require('./assets/logo.png')} style={styles.logoImage} />
      <Text style={styles.title}>Veia</Text>
      <Text style={styles.subtitle}>Welcome back! Please sign in</Text>
      <View style={styles.inputGroup}>
        <Text style={styles.inputTitle}>Username</Text>
        <View style={styles.input}>
          <User color={'#898f99'} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your username"
            placeholderTextColor={'#898f99'}
          />
        </View>
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.inputTitle}>Password</Text>
        <View style={styles.input}>
          <Lock width={20} color={'#898f99'} style={{marginHorizontal: 2}} />
          <TextInput
            style={styles.textInput}
            placeholder="Enter your password"
            placeholderTextColor={'#898f99'}
          />
        </View>
      </View>
      <TouchableNativeFeedback>
        <View style={styles.submitButton}>
          <Text style={{color: 'white', fontSize: 17, letterSpacing: 0.6}}>
            Login
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
    marginTop: 30,
  },
});
