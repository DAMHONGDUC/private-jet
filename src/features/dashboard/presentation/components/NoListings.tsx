import LottieView from 'lottie-react-native';
import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { NO_PLANE_FOUND } from '@/core/ui/images';
import { PressableScale } from '@/core/ui/PressableScale';
import { resultsStateStyles as shared } from './results-styles';

/** No jet for any leg: the empty plane animation and a way back to the form. */
export function NoListings({ onNewRequest }: { onNewRequest: () => void }) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <View testID="no-listings" style={shared.empty}>
      <LottieView
        testID="no-listings-animation"
        source={NO_PLANE_FOUND[palette.scheme]}
        autoPlay
        loop
        style={styles.lottie}
      />
      <BJText size={20}>{t('results.noJets')}</BJText>
      <BJText tone="secondary" weight="regular" style={shared.centered}>
        {t('results.noJetsMessage')}
      </BJText>
      <PressableScale
        testID="new-flight-request"
        accessibilityRole="button"
        onPress={onNewRequest}
        style={[shared.button, { backgroundColor: palette.primaryAction }]}
      >
        <BJText tone="onPrimary">{t('results.newRequest')}</BJText>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  lottie: { width: 180, height: 180 },
});
