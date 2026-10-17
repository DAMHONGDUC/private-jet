import { useState } from 'react';
import { ScrollView, Switch, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { BottomSheet } from '@/core/ui/BottomSheet';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { CountUp } from '@/core/ui/CountUp';
import { Screen } from '@/core/ui/Screen';
import { StatusPill } from '@/core/ui/StatusPill';
import { haptics } from '@/core/ui/haptics';
import { formatCompactNumber, formatMoney } from '@/core/utils/format';
import { useSignOutMutation } from '@/features/auth/presentation/auth-api';
import { selectUser } from '@/features/auth/presentation/session-slice';
import { isUpcoming } from '@/features/booking/domain/entities/booking';
import { paymentLabel } from '@/features/booking/domain/entities/payment';
import { useGetBookingsQuery, useGetPaymentMethodsQuery } from '@/features/booking/presentation/booking-api';
import { Avatar } from '../components/Avatar';
import { MenuRow } from '../components/MenuRow';
import { notificationToggled, selectNotificationPrefs, type NotificationPrefs } from '../settings-slice';

type Props = {
  onEditProfile: () => void;
  onOpenPayments: () => void;
  onOpenHelp: () => void;
  onOpenLegal: () => void;
  /** Splits upcoming trips from the rest; tests pin it. */
  now?: Date;
};

const NOTIFICATIONS: { key: keyof NotificationPrefs; title: string; detail: string }[] = [
  { key: 'flightUpdates', title: 'Flight updates', detail: 'Gate, crew and schedule changes' },
  { key: 'concierge', title: 'Concierge messages', detail: 'Replies from your BlackJet team' },
  { key: 'offers', title: 'Empty legs & offers', detail: 'Last-minute repositioning flights' },
];

const memberSince = (iso: string) =>
  new Date(iso).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });

/** The member: who they are, what they fly, how they pay, what they hear about; and signing out. */
export function ProfileScreen({ onEditProfile, onOpenPayments, onOpenHelp, onOpenLegal, now: nowProp }: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const prefs = useSelector(selectNotificationPrefs);
  const [now] = useState(() => nowProp ?? new Date());
  const [confirming, setConfirming] = useState(false);
  const { data: bookings } = useGetBookingsQuery();
  const { data: methods } = useGetPaymentMethodsQuery();
  const [signOut, { isLoading: signingOut }] = useSignOutMutation();

  if (!user) {
    return <Screen top>{null}</Screen>;
  }

  const flown = (bookings ?? []).filter(booking => booking.status === 'confirmed');
  const upcoming = flown.filter(booking => isUpcoming(booking, now)).length;
  const wallet = methods?.find(method => method.kind === 'wallet');
  const preferred = methods?.find(method => method.isDefault);

  const stats = [
    { label: 'Trips', value: flown.length, format: (value: number) => String(value), testID: 'stat-trips' },
    { label: 'Upcoming', value: upcoming, format: (value: number) => String(value), testID: 'stat-upcoming' },
    {
      label: 'Wallet',
      value: wallet?.balance ?? 0,
      format: (value: number) =>
        value >= 100_000 ? `€${formatCompactNumber(value)}` : formatMoney(value, wallet?.currency ?? 'EUR'),
      testID: 'stat-wallet',
    },
  ];

  return (
    <Screen top>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Animated.View entering={ZoomIn.springify().damping(14)}>
            <Avatar testID="profile-avatar" name={user.fullName} size={84} ring={palette.iron} ringWidth={2} />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(450).delay(80)} style={styles.identity}>
            <AppText testID="profile-name" variant="display">
              {user.fullName}
            </AppText>
            <AppText muted>{user.email}</AppText>
            <View style={styles.tierRow}>
              <StatusPill label={user.tier} tone="inverse" />
              <AppText variant="caption" muted>
                Member since {memberSince(user.memberSince)}
              </AppText>
            </View>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.duration(450).delay(160)}>
          <Card style={styles.stats}>
            {stats.map((stat, index) => (
              <View key={stat.label} style={[styles.stat, index > 0 && styles.statDivider]}>
                <CountUp testID={stat.testID} variant="title" value={stat.value} format={stat.format} />
                <AppText variant="caption" muted>
                  {stat.label}
                </AppText>
              </View>
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(240)} style={styles.section}>
          <AppText variant="label" muted>
            Account
          </AppText>
          <Card style={styles.list}>
            <MenuRow
              testID="menu-personal"
              title="Personal information"
              detail={`${user.fullName} · ${user.phone}`}
              onPress={onEditProfile}
            />
            <MenuRow
              testID="menu-payments"
              title="Payment methods"
              detail={preferred ? `Default: ${paymentLabel(preferred)}` : undefined}
              onPress={onOpenPayments}
              last
            />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(320)} style={styles.section}>
          <AppText variant="label" muted>
            Notifications
          </AppText>
          <Card style={styles.list}>
            {NOTIFICATIONS.map((item, index) => (
              <MenuRow
                key={item.key}
                title={item.title}
                detail={item.detail}
                last={index === NOTIFICATIONS.length - 1}
                trailing={
                  <Switch
                    testID={`notify-${item.key}`}
                    value={prefs[item.key]}
                    onValueChange={() => {
                      haptics.selection();
                      dispatch(notificationToggled(item.key));
                    }}
                    trackColor={{ false: palette.iron, true: palette.jetBlack }}
                    thumbColor={palette.scheme === 'dark' && prefs[item.key] ? '#000000' : '#FFFFFF'}
                    ios_backgroundColor={palette.iron}
                  />
                }
              />
            ))}
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(400)} style={styles.section}>
          <AppText variant="label" muted>
            Support
          </AppText>
          <Card style={styles.list}>
            <MenuRow testID="menu-help" title="Help & FAQ" detail="Bookings, payments, on the day" onPress={onOpenHelp} />
            <MenuRow testID="menu-legal" title="Terms & privacy" onPress={onOpenLegal} last />
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(450).delay(480)} style={styles.section}>
          <Button testID="sign-out" title="Sign out" variant="danger" onPress={() => setConfirming(true)} />
          <AppText variant="caption" muted style={styles.version}>
            BlackJet demo · version 1.0.0
          </AppText>
        </Animated.View>
      </ScrollView>

      <BottomSheet visible={confirming} title="Sign out?" onClose={() => setConfirming(false)} testID="sign-out-sheet">
        <View style={styles.sheet}>
          <AppText muted>Your trips and cards stay on your account. Sign back in any time with the demo account.</AppText>
          <Button
            testID="confirm-sign-out"
            title="Sign out"
            variant="danger"
            loading={signingOut}
            onPress={async () => {
              haptics.light();
              await signOut();
              setConfirming(false);
            }}
          />
        </View>
      </BottomSheet>
    </Screen>
  );
}

const useStyles = makeStyles(palette => ({
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  header: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.md },
  identity: { alignItems: 'center', gap: spacing.xs },
  tierRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.xs },
  stats: { flexDirection: 'row', paddingHorizontal: 0, paddingVertical: spacing.lg },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: palette.iron },
  section: { gap: spacing.sm },
  list: { paddingVertical: 0 },
  version: { textAlign: 'center', marginTop: spacing.md },
  sheet: { gap: spacing.md, paddingTop: spacing.sm },
}));
