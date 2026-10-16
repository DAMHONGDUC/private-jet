import { ActivityIndicator, StyleSheet, View } from 'react-native';
import type { AppError } from '@/core/error/app-error';
import { colors, spacing } from '@/core/theme/theme';
import { AppText } from './AppText';
import { Button } from './Button';

export function LoadingView() {
  return (
    <View style={styles.center} testID="loading-view">
      <ActivityIndicator color={colors.gold} size="large" />
    </View>
  );
}

/** Reads the message off an RTK Query error, which is an `AppError` here. */
export function errorMessage(error: unknown): string {
  const message = (error as Partial<AppError> | undefined)?.message;
  return typeof message === 'string' ? message : 'Something went wrong.';
}

export function ErrorView({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.center} testID="error-view">
      <AppText variant="subtitle">Something went wrong</AppText>
      <AppText muted style={styles.message}>
        {errorMessage(error)}
      </AppText>
      {onRetry ? <Button title="Try again" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyView({ title, message }: { title: string; message: string }) {
  return (
    <View style={styles.center} testID="empty-view">
      <AppText variant="subtitle">{title}</AppText>
      <AppText muted style={styles.message}>
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  message: { textAlign: 'center' },
});
