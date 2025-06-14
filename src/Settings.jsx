import {
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
  ScrollView,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  MessageSquare,
  Shield,
  Bell,
  Palette,
  Globe,
  HelpCircle,
  LogOut,
  ChevronRight,
} from 'lucide-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Avatar from './components/avatar';
import {useSelector, useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

function SettingsScreen({navigation}) {
  const insets = useSafeAreaInsets();
  const user = useSelector(state => state.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await AsyncStorage.removeItem('accessToken');
            await AsyncStorage.removeItem('refreshToken');
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          } catch (error) {
            console.error('Error during logout:', error);
          }
        },
      },
    ]);
  };

  const SettingsItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
  }) => (
    <TouchableNativeFeedback onPress={onPress}>
      <View style={styles.settingsItem}>
        <View style={styles.settingsItemLeft}>
          <View style={styles.iconContainer}>{icon}</View>
          <View style={styles.textContainer}>
            <Text style={styles.settingsTitle}>{title}</Text>
            {subtitle && (
              <Text style={styles.settingsSubtitle}>{subtitle}</Text>
            )}
          </View>
        </View>
        {showChevron && <ChevronRight color={'#ababab'} size={20} />}
      </View>
    </TouchableNativeFeedback>
  );

  const SectionHeader = ({title}) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
    </View>
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={[styles.header, {height: 60}]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}>
          <ArrowLeft color={'white'} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{width: 24}} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* User Profile Section */}
        <TouchableNativeFeedback
          onPress={() => navigation.navigate('EditProfile')}>
          <View style={styles.profileSection}>
            <Avatar url={user?.avatar} name={user?.display_name} width={60} />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.display_name}</Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
            <ChevronRight color={'#ababab'} size={20} />
          </View>
        </TouchableNativeFeedback>

        <View style={styles.divider} />

        {/* Settings Sections */}
        <SectionHeader title="SETTINGS" />

        <SettingsItem
          icon={<MessageSquare color={'#c96442'} size={22} />}
          title="UI Settings"
          subtitle="Background, font size, bubble style"
          onPress={() => navigation.navigate('UISettings')}
        />

        <SettingsItem
          icon={<Shield color={'#4A90E2'} size={22} />}
          title="Privacy & Security"
          subtitle="Blocked users, two-step verification"
          onPress={() => navigation.navigate('PrivacySecurity')}
        />

        <SettingsItem
          icon={<Bell color={'#50C878'} size={22} />}
          title="Notifications and Sounds"
          subtitle="Message notifications, group notifications"
          onPress={() => navigation.navigate('NotificationSettings')}
        />

        <View style={styles.divider} />

        <SectionHeader title="APPEARANCE" />

        <SettingsItem
          icon={<Palette color={'#FF6B6B'} size={22} />}
          title="Theme"
          subtitle="Dark"
          onPress={() => navigation.navigate('ThemeSettings')}
        />

        <View style={styles.divider} />

        <SectionHeader title="GENERAL" />

        <SettingsItem
          icon={<Globe color={'#9B59B6'} size={22} />}
          title="Language"
          subtitle="English"
          onPress={() => navigation.navigate('LanguageSettings')}
        />

        <SettingsItem
          icon={<HelpCircle color={'#F39C12'} size={22} />}
          title="Help & Support"
          subtitle="FAQ, contact us, privacy policy"
          onPress={() => navigation.navigate('HelpSupport')}
        />

        <View style={styles.divider} />

        {/* Logout Section */}
        <TouchableNativeFeedback onPress={handleLogout}>
          <View style={styles.logoutItem}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.iconContainer, styles.logoutIconContainer]}>
                <LogOut color={'#E74C3C'} size={22} />
              </View>
              <Text style={styles.logoutText}>Log Out</Text>
            </View>
          </View>
        </TouchableNativeFeedback>

        <View style={{height: 50}} />
      </ScrollView>
    </View>
  );
}

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141516',
  },
  header: {
    backgroundColor: '#202324',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#4A4F4B',
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollContainer: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#202324',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#ababab',
  },
  divider: {
    height: 1,
    backgroundColor: '#4A4F4B',
  },
  sectionHeader: {
    backgroundColor: '#1A1B1C',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c96442',
    letterSpacing: 0.5,
  },
  settingsItem: {
    backgroundColor: '#202324',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#4A4F4B',
    borderBottomWidth: 0.5,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingsSubtitle: {
    fontSize: 14,
    color: '#ababab',
  },
  logoutItem: {
    backgroundColor: '#202324',
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutIconContainer: {
    backgroundColor: 'rgba(231, 76, 60, 0.1)',
  },
  logoutText: {
    fontSize: 16,
    color: '#E74C3C',
    fontWeight: '500',
  },
});
