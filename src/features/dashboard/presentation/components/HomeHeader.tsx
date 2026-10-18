import { StyleSheet, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { Wordmark } from '@/core/ui/Wordmark';
import { selectUser } from '@/features/auth/presentation/session-slice';
import { useGetInboxSummaryQuery } from '@/features/inbox/presentation/inbox-api';

type AppBarProps = {
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
};

/** Logo on the left; chat and bell with unread badges on the right (feature-docs/dashboard §2.1). */
export function HomeAppBar({
  onOpenMessages,
  onOpenNotifications,
}: AppBarProps) {
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

type BadgeButtonProps = {
  testID: string;
  icon: IconName;
  label: string;
  count: number;
  onPress?: () => void;
};

function BadgeButton({
  testID,
  icon,
  label,
  count,
  onPress,
}: BadgeButtonProps) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={
        count > 0 ? t('home.unread', { label, count }) : label
      }
      disabled={!onPress}
      onPress={onPress}
      style={[styles.button, { backgroundColor: palette.primaryBackground }]}
    >
      <Icon name={icon} size={22} color={palette.jetBlack} />
      {count > 0 ? (
        <View
          testID={`${testID}-badge`}
          style={[
            styles.badge,
            {
              backgroundColor: palette.accent,
              borderColor: palette.secondaryBackground,
            },
          ]}
        >
          <BJText size={13} tone="onAccent">
            {count > 99 ? '99+' : count}
          </BJText>
        </View>
      ) : null}
    </PressableScale>
  );
}

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

const BUTTON = 44;

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: AppSpacing.lg,
    paddingVertical: AppSpacing.sm,
  },
  actions: { flexDirection: 'row', gap: AppSpacing.sm },
  button: {
    width: BUTTON,
    height: BUTTON,
    borderRadius: BUTTON / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 22,
    height: 22,
    borderRadius: radius.pill,
    borderWidth: 2,
    paddingHorizontal: AppSpacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingHorizontal: AppSpacing.lg,
    paddingTop: AppSpacing.lg,
    paddingBottom: AppSpacing.xl,
    gap: AppSpacing.xs,
  },
});
