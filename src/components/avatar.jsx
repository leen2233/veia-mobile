import {Image} from 'react-native';

const Avatar = ({url, width}) => {
  return (
    <Image
      source={{
        uri: url,
      }}
      style={{
        width: width,
        height: width,
        borderRadius: width / 2,
      }}
    />
  );
};

export default Avatar;
