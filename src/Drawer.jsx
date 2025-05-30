import {
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from './components/avatar';
import {
  Bookmark,
  CircleUserRound,
  Phone,
  Settings,
  UserRound,
  Users,
} from 'lucide-react-native';

function DrawerContent({navigation}) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Avatar
          url={
            'https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/56.jpg'
          }
          width={60}
        />
        <View style={{height: 60, justifyContent: 'center'}}>
          <Text
            style={{
              color: 'white',
              fontSize: 20,
              fontWeight: 'bold',
            }}>
            John Doe
          </Text>
          <Text style={{color: '#ababab'}}>+15598331751</Text>
        </View>
      </View>
      <TouchableNativeFeedback>
        <View style={styles.button}>
          <CircleUserRound color={'#ababab'} size={22} />
          <Text style={{color: 'white', fontSize: 16}}>My Profile</Text>
        </View>
      </TouchableNativeFeedback>
      <View style={styles.divider}></View>
      <TouchableNativeFeedback>
        <View style={styles.button}>
          <Users color={'#ababab'} size={22} />
          <Text style={{color: 'white', fontSize: 16}}>New Group</Text>
        </View>
      </TouchableNativeFeedback>
      <TouchableNativeFeedback>
        <View style={styles.button}>
          <UserRound color={'#ababab'} size={22} />
          <Text style={{color: 'white', fontSize: 16}}>Contacts</Text>
        </View>
      </TouchableNativeFeedback>
      <TouchableNativeFeedback>
        <View style={styles.button}>
          <Phone color={'#ababab'} size={22} />
          <Text style={{color: 'white', fontSize: 16}}>Calls</Text>
        </View>
      </TouchableNativeFeedback>
      <TouchableNativeFeedback>
        <View style={styles.button}>
          <Bookmark color={'#ababab'} size={22} />
          <Text style={{color: 'white', fontSize: 16}}>Saved</Text>
        </View>
      </TouchableNativeFeedback>
      <TouchableNativeFeedback>
        <View style={styles.button}>
          <Settings color={'#ababab'} size={22} />
          <Text style={{color: 'white', fontSize: 16}}>Settings</Text>
        </View>
      </TouchableNativeFeedback>
    </View>
  );
}

export default DrawerContent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#202324',
  },
  header: {
    width: '100%',
    height: 160,
    backgroundColor: '#333333',
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    padding: 10,
  },
  button: {
    width: '100%',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 30,
  },
  divider: {
    height: 2,
    width: '100%',
    backgroundColor: '#4A4F4B',
  },
});
