import React, {useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableNativeFeedback,
  ScrollView,
  Image,
  Dimensions,
  BackHandler,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import {
  ArrowLeft,
  EllipsisVertical,
  Phone,
  Video,
  MessageCircle,
  Bell,
  Shield,
  Palette,
  Moon,
  Users,
  Info,
  Camera,
  Edit3,
} from 'lucide-react-native';
import {StyleSheet} from 'react-native';
import Avatar from './avatar';

const {height: screenHeight} = Dimensions.get('window');

const Header = ({top, navigation, chat}) => {
  const height = useSharedValue(top + 80);

  const headerStyle = useAnimatedStyle(() => {
    return {
      height: height.value,
    };
  });

  const nameInfoStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      height.value,
      [top + 80, screenHeight],
      [0, 70],
    );
    const translateX = interpolate(
      height.value,
      [top + 80, screenHeight],
      [0, -25],
    );
    const opacity = interpolate(height.value, [top + 80, top + 200], [1, 0]);

    return {
      transform: [{translateY}, {translateX}],
      opacity,
    };
  });

  const avatarStyle = useAnimatedStyle(() => {
    const scale = interpolate(height.value, [top + 80, screenHeight], [1, 1.5]);
    return {
      transform: [{scale}],
    };
  });

  const expandedContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(height.value, [top + 80, top + 300], [0, 1]);
    const translateY = interpolate(
      height.value,
      [top + 80, top + 300],
      [50, top],
    );

    return {
      opacity,
      transform: [{translateY}],
    };
  });

  const togglePanel = () => {
    const isExpanded = height.value > top + 100;

    height.value = withTiming(isExpanded ? top + 80 : top + screenHeight, {
      duration: 400,
    });
  };

  const userStats = [
    {label: 'Photos', value: '127'},
    {label: 'Videos', value: '34'},
    {label: 'Files', value: '89'},
    {label: 'Links', value: '15'},
  ];

  const settingsItems = [
    {icon: Bell, label: 'Notifications', subtitle: 'On'},
    {
      icon: Shield,
      label: 'Privacy and Security',
      subtitle: 'Last seen recently',
    },
    {icon: Palette, label: 'Chat Theme', subtitle: 'Default'},
    {icon: Moon, label: 'Auto-Delete Messages', subtitle: 'Off'},
    {icon: Users, label: 'Add to Group', subtitle: ''},
    {icon: Info, label: 'More Info', subtitle: ''},
  ];

  const backClicked = () => {
    const isExpanded = height.value > top + 80;
    if (isExpanded) {
      togglePanel();
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backClicked,
    );

    return () => backHandler.remove();
  }, []);

  return (
    <Animated.View style={[styles.header, headerStyle, {paddingTop: top}]}>
      {/* Top Navigation Bar */}
      <View style={styles.topBar}>
        <View style={styles.leftSection}>
          <TouchableNativeFeedback onPress={backClicked}>
            <View style={styles.iconButton}>
              <ArrowLeft color="white" size={24} />
            </View>
          </TouchableNativeFeedback>

          <TouchableOpacity onPress={togglePanel} style={styles.userInfo}>
            <Animated.View style={[styles.avatarContainer, nameInfoStyle]}>
              <Avatar
                url={chat && chat.user.avatar}
                name={chat && chat.user.username}
                width={50}
                style={avatarStyle}
              />

              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {chat && chat.user.username}
                </Text>
                <Text style={{color: '#c96442'}}>online</Text>
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <TouchableNativeFeedback>
          <View style={styles.iconButton}>
            <EllipsisVertical color="white" size={24} />
          </View>
        </TouchableNativeFeedback>
      </View>

      <Animated.View style={[styles.expandedContent, expandedContentStyle]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.profileSection}>
            <View style={styles.profileImageContainer}>
              <Avatar
                url={chat?.user?.avatar}
                name={chat?.user?.username}
                width={60}
              />
              <View>
                <Text style={styles.profileName}>{chat?.user?.username}</Text>
                <Text style={styles.profilePhone}>{chat?.user?.email}</Text>
              </View>
            </View>
            {chat?.user?.bio && (
              <Text style={styles.profileBio}>{chat.user.bio}</Text>
            )}
          </View>
          <View style={styles.statsContainer}>
            {userStats.map((stat, index) => (
              <TouchableOpacity key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Settings */}
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Settings</Text>
            {settingsItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.settingItem}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIcon}>
                    <item.icon color="#ababab" size={22} />
                  </View>
                  <View>
                    <Text style={styles.settingLabel}>{item.label}</Text>
                    {item.subtitle ? (
                      <Text style={styles.settingSubtitle}>
                        {item.subtitle}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

export default Header;

const styles = {
  header: {
    backgroundColor: '#202324',
    overflow: 'hidden',
    borderColor: 'grey',
    borderBottomWidth: 1,
  },
  topBar: {
    height: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  userInfo: {
    marginLeft: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    backgroundColor: '#10B981',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  userStatus: {
    color: '#BFDBFE',
    fontSize: 14,
    marginTop: 2,
  },
  expandedContent: {
    flex: 1,
    backgroundColor: '#202324',
    marginTop: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: '#ababab',
  },
  profileBio: {
    fontSize: 14,
    color: '#ababab',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: '#ababab',
    marginTop: 4,
  },
  settingsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'grey',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#c96442',
    marginTop: 2,
  },
};
