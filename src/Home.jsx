import {MenuIcon, Search} from 'lucide-react-native';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

const Header = ({navigation}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={() => navigation.openDrawer()}>
        <MenuIcon color={'white'} size={20} />
      </TouchableOpacity>
      <Text
        style={{
          fontSize: 20,
          fontWeight: 'bold',
          color: '#fff',
          textAlign: 'center',
          marginVertical: 10,
        }}>
        Veia
      </Text>
      <TouchableOpacity onPress={() => alert('This is a button!')}>
        <Search color={'white'} size={20} />
      </TouchableOpacity>
    </View>
  );
};

function HomeScreen({navigation}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#141516',
      }}>
      <Header navigation={navigation} />
      <Text>Home Screen</Text>
    </View>
  );
}

export default HomeScreen;

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#202324',
    padding: 20,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: 80,
    position: 'absolute',
    top: 0,
  },
});
