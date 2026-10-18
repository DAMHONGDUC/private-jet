import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { Wordmark } from '@/core/ui/Wordmark';
import { useGetInboxSummaryQuery } from '@/features/inbox/presentation/inbox-api';
import { BadgeButton } from './BadgeButton';

type Props = {
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
};

/** Logo on the left; chat and bell with unread badges on the right (feature-docs/dashboard §2.1). */
export function HomeAppBar({ onOpenMessages, onOpenNotifications }: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const { data: inbox } = useGetInboxSummaryQuery();

  return (
    <View
      style={[styles.bar, { backgroundColor: palette.secondaryBackground }]}
    >
      <Wordmark testID="home-logo" />
      <View style={styles.actions}>
        <BadgeButton
          testID="open-messages"
          icon="chat"
          label={t('home.messages')}
          count={inbox?.unreadMessages ?? 0}
          onPress={onOpenMessages}
        />
        <BadgeButton
          testID="open-notifications"
          icon="bell"
          label={t('home.notifications')}
          count={inbox?.unreadNotifications ?? 0}
          onPress={onOpenNotifications}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.spacing16,
    paddingVertical: AppSpacing.spacing8,
  },
  actions: { flexDirection: 'row', gap: AppSpacing.spacing8 },
});
