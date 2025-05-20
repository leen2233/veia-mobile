import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

function DrawerContent({navigation}) {
  return (
    <View style={styles.container}>
      {/* Custom button to navigate to Home */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>Go to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

export default DrawerContent;

const styles = StyleSheet.create({
  container: {
    flex: 1, // fill drawer height
    backgroundColor: '#202324',
    paddingTop: 40, // top padding
    paddingHorizontal: 20, // side padding
  },
  button: {
    marginVertical: 10,
    paddingVertical: 12,
    backgroundColor: '#333',
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
