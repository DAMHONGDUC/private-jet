import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useT } from '@/core/i18n/i18n';
import { AppSpacing } from '@/core/theme/app-spacing';
import { BJText } from '@/core/ui/BJText';
import { selectUser } from '@/features/auth/presentation/session-slice';

/** The greeting above the search: by the time of day, with the member's first name. */
export function HeroText({ now }: { now?: Date }) {
  const t = useT();
  const user = useSelector(selectUser);
  const hour = (now ?? new Date()).getHours();
  const greeting = t(
    hour < 12 ? 'home.morning' : hour < 18 ? 'home.afternoon' : 'home.evening',
  );
  const name = user?.fullName.split(' ')[0];
  return (
    <View style={styles.hero}>
      <BJText size={28}>
        {name ? t('home.greeting', { greeting, name }) : t('home.title')}
      </BJText>
      <BJText tone="secondary" weight="regular">
        {t('home.subtitle')}
      </BJText>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: AppSpacing.spacing16,
    paddingTop: AppSpacing.spacing16,
    paddingBottom: AppSpacing.spacing24,
    gap: AppSpacing.spacing4,
  },
});
