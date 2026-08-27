import { Platform, StatusBar } from 'react-native';

const AppStatusBar = ({ barStyle }) => (
  <StatusBar
    barStyle={barStyle}
    {...(Platform.OS === 'android'
      ? { backgroundColor: 'transparent', translucent: true }
      : { animated: true })}
  />
);

export default AppStatusBar;
