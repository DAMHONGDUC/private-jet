import { View } from 'react-native';
import { AppText } from './AppText';
import { stateViewStyles as styles } from './state-view-styles';

export function EmptyView({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <View style={styles.center} testID="empty-view">
      <AppText variant="subtitle">{title}</AppText>
      <AppText muted style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}
