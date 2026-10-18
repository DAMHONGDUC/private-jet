import { StyleSheet, View } from 'react-native';
import { errorMessage } from '@/core/error/error-message';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { resultsStateStyles as shared } from './results-styles';

/** The quotes failed to load: why, and a retry. */
export function ResultsLoadError({
  error,
  onRetry,
}: {
  error: unknown;
  onRetry: () => void;
}) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <View testID="jet-results-error" style={shared.empty}>
      <BJText tone="secondary" weight="regular" style={shared.centered}>
        {t('results.loadError', { error: errorMessage(error) })}
      </BJText>
      <PressableScale
        testID="jet-results-retry"
        accessibilityRole="button"
        onPress={onRetry}
        style={[shared.button, styles.outlined, { borderColor: palette.iron }]}
      >
        <BJText size={16}>{t('common.tryAgain')}</BJText>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  outlined: { borderWidth: 1 },
});
