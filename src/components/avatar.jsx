import {Image, View, Text} from 'react-native';
import Animated from 'react-native-reanimated';

const Avatar = ({url, name, width, style}) => {
  function getInitials(str) {
    if (!str) {
      return '';
    }
    const words = str.trim().split(/\s+/);
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    } else {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
  }

  const avatarColors = [
    '#5A8DEE',
    '#39C36E',
    '#F4B400',
    '#E040FB',
    '#FF6E40',
    '#00BCD4',
    '#FF8A65',
    '#7E57C2',
    '#26A69A',
    '#EC407A',
  ];

  return (
    <Animated.View
      style={[
        {
          width: width,
          height: width,
          borderRadius: width / 2,
          overflow: 'hidden',
          backgroundColor: url
            ? 'transparent'
            : avatarColors[
                getInitials(name).charCodeAt(0) % avatarColors.length
              ],
          justifyContent: 'center',
          alignItems: 'center',
        },
        style,
      ]}>
      {url ? (
        <Image
          source={{
            uri: url,
          }}
          style={{width: '100%', height: '100%'}}
        />
      ) : (
        <Text style={{color: 'white', fontSize: width / 1.5}}>
          {getInitials(name)}
        </Text>
      )}
    </Animated.View>
  );
};

export default Avatar;
