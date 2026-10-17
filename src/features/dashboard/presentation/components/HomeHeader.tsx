import { Image, StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { Icon, type IconName } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { useGetInboxSummaryQuery } from '@/features/inbox/presentation/inbox-api';
import { LOGO } from '@/core/ui/images';

type AppBarProps = { onOpenMessages?: () => void; onOpenNotifications?: () => void };

/** Logo on the left; chat and bell with unread badges on the right (feature-docs/dashboard §2.1). */
export function HomeAppBar({ onOpenMessages, onOpenNotifications }: AppBarProps) {
  const palette = useBlackJetTheme();
  const { data: inbox } = useGetInboxSummaryQuery();

  return (
    <View style={[styles.bar, { backgroundColor: palette.secondaryBackground }]}>
      <Image
        testID="home-logo"
        source={LOGO[palette.scheme]}
        resizeMode="cover"
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

type BadgeButtonProps = { testID: string; icon: IconName; label: string; count: number; onPress?: () => void };

function BadgeButton({ testID, icon, label, count, onPress }: BadgeButtonProps) {
  const palette = useBlackJetTheme();
  return (
    <PressableScale
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={count > 0 ? `${label}, ${count} unread` : label}
      disabled={!onPress}
      onPress={onPress}
      style={styles.button}
    >
      <Icon name={icon} size={30} color={palette.jetBlack} />
      {count > 0 ? (
        <View testID={`${testID}-badge`} style={[styles.badge, { backgroundColor: palette.error }]}>
          <BJText size={12} tone="white">
            {count > 99 ? '99+' : count}
          </BJText>
        </View>
      ) : null}
    </PressableScale>
  );
}

/** "Flying Private Made Simple" and its subtitle (feature-docs/dashboard §2.2). */
export function HeroText() {
  return (
    <View style={styles.hero}>
      <BJText size={32} adjustsFontSizeToFit minimumFontScale={0.6} numberOfLines={2}>
        {'Flying Private Made\nSimple'}
      </BJText>
      <BJText size={16} tone="secondary">
        Book Your Private Jet Instantly
      </BJText>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, paddingRight: 24 },
  logo: { width: 128.6, height: 45, borderRadius: 8 },
  actions: { flexDirection: 'row', gap: 4 },
  button: { width: 50, height: 50, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { paddingHorizontal: 12, paddingTop: 10, paddingBottom: 24, gap: 12 },
});
