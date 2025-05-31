import {Image} from 'react-native';
import Animated from 'react-native-reanimated';

const Avatar = ({url, width, style}) => {
  return (
    <Animated.View
      style={[
        {
          width: width,
          height: width,
          borderRadius: width / 2,
          overflow: 'hidden',
        },
        style,
      ]}>
      <Image
        source={{
          uri: url,
        }}
        style={{width: '100%', height: '100%'}}
      />
    </Animated.View>
  );
};

export default Avatar;
