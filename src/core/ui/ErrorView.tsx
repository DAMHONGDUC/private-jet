import { View } from 'react-native';
import { errorMessage } from '@/core/error/error-message';
import { AppText } from './AppText';
import { Button, ButtonVariant } from './Button';
import { stateViewStyles as styles } from './state-view-styles';

export function ErrorView({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.center} testID="error-view">
      <AppText variant="subtitle">Something went wrong</AppText>
      <AppText muted style={styles.message}>
        {errorMessage(error)}
      </AppText>
      {onRetry ? (
        <Button
          title="Try again"
          variant={ButtonVariant.Secondary}
          onPress={onRetry}
        />
      ) : null}
    </View>
  );
}
