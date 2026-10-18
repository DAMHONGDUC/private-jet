import { ActivityIndicator, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { stateViewStyles as styles } from './state-view-styles';

export function LoadingView() {
  const palette = useBlackJetTheme();
  return (
    <View style={styles.center} testID="loading-view">
      <ActivityIndicator color={palette.accent} size="large" />
    </View>
  );
}
