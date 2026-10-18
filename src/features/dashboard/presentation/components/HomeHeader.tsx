import { Image, StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { radius, spacing } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { LOGO, LOGO_ASPECT } from '@/core/ui/images';
import { useGetInboxSummaryQuery } from '@/features/inbox/presentation/inbox-api';

type AppBarProps = {
  onOpenMessages?: () => void;
  onOpenNotifications?: () => void;
};

const LOGO_HEIGHT = 28;

/** Logo on the left; chat and bell with unread badges on the right (feature-docs/dashboard §2.1). */
export function HomeAppBar({
  onOpenMessages,
  onOpenNotifications,
}: AppBarProps) {
  const palette = useBlackJetTheme();
  const { data: inbox } = useGetInboxSummaryQuery();

  return (
    <View
      style={[styles.bar, { backgroundColor: palette.secondaryBackground }]}
    >
      <Image
        testID="home-logo"
        source={LOGO[palette.scheme]}
        resizeMode="contain"
        accessibilityLabel="BlackJet"
        style={styles.logo}
      />
      <View style={styles.actions}>
        <BadgeButton
          testID="open-messages"
          icon="chat"
          label="Messages"
          count={inbox?.unreadMessages ?? 0}
          onPress={onOpenMessages}
        />
        <BadgeButton
          testID="open-notifications"
          icon="bell"
          label="Notifications"
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
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `${label}, ${count} unread` : label}
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

/** The greeting above the search. */
export function HeroText() {
  return (
    <View style={styles.hero}>
      <BJText size={28}>Where to next?</BJText>
      <BJText tone="secondary" weight="regular">
        Charter a private jet in minutes.
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  logo: { height: LOGO_HEIGHT, width: LOGO_HEIGHT * LOGO_ASPECT },
  actions: { flexDirection: 'row', gap: spacing.sm },
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
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.xs,
  },
});
