import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { APP_FULL_NAME } from '@/core/app-identity';
import { useT, type TranslationKey } from '@/core/i18n/i18n';
import {
  LANGUAGES,
  THEME_MODES,
  languageSelected,
  selectThemeMode,
  themeModeSelected,
  Language,
  ThemeMode,
} from '@/core/preferences/preferences-slice';
import { AppColors } from '@/core/theme/app-colors';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Switch, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { BottomSheet, SheetOption } from '@/core/ui/BottomSheet';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { Screen } from '@/core/ui/Screen';
import { StatusPill, StatusTone } from '@/core/ui/StatusPill';
import { haptics } from '@/core/ui/haptics';
import { formatCompactMoney, formatMoney } from '@/core/utils/format';
import { useSignOutMutation } from '@/features/auth/presentation/auth-api';
import { selectUser } from '@/features/auth/presentation/session-slice';
import {
  BookingStatus,
  isUpcoming,
} from '@/features/booking/domain/entities/booking';
import {
  paymentLabel,
  PaymentMethodKind,
} from '@/features/booking/domain/entities/payment';
import {
  useGetBookingsQuery,
  useGetPaymentMethodsQuery,
} from '@/features/booking/presentation/booking-api';
import { Avatar } from '../components/Avatar';
import { MenuRow } from '../components/MenuRow';
import {
  notificationToggled,
  selectNotificationPrefs,
  type NotificationPrefs,
} from '../settings-slice';

type Props = {
  onEditProfile: () => void;
  onOpenPayments: () => void;
  onOpenHelp: () => void;
  onOpenLegal: () => void;
  /** Splits upcoming trips from the rest; tests pin it. */
  now?: Date;
};

const NOTIFICATIONS: {
  key: keyof NotificationPrefs;
  title: TranslationKey;
  detail: TranslationKey;
}[] = [
  {
    key: 'flightUpdates',
    title: 'profile.flightUpdates',
    detail: 'profile.flightUpdatesDetail',
  },
  {
    key: 'concierge',
    title: 'profile.conciergeMessages',
    detail: 'profile.conciergeMessagesDetail',
  },
  {
    key: 'offers',
    title: 'profile.offers',
    detail: 'profile.offersDetail',
  },
];

/** The preference whose sheet is open. */
enum PreferenceSheet {
  AppearancePicker = 'appearance',
  LanguagePicker = 'language',
}

const THEME_LABELS: Record<ThemeMode, TranslationKey> = {
  [ThemeMode.System]: 'profile.appearanceSystem',
  [ThemeMode.Light]: 'profile.appearanceLight',
  [ThemeMode.Dark]: 'profile.appearanceDark',
};

const DATE_LOCALES: Record<Language, string> = {
  [Language.English]: 'en-AU',
  [Language.Vietnamese]: 'vi-VN',
};

const memberSince = (iso: string, language: Language) =>
  new Date(iso).toLocaleDateString(DATE_LOCALES[language], {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

/** The member: who they are, what they fly, how they pay, what they hear about; and signing out. */
export function ProfileScreen({
  onEditProfile,
  onOpenPayments,
  onOpenHelp,
  onOpenLegal,
  now: nowProp,
}: Props) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const palette = useBlackJetTheme();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const prefs = useSelector(selectNotificationPrefs);
  const themeMode = useSelector(selectThemeMode);
  const t = useT();
  const [now] = useState(() => nowProp ?? new Date());
  const [confirming, setConfirming] = useState(false);
  /** Which preference's sheet is open. */
  const [picking, setPicking] = useState<PreferenceSheet | null>(null);
  const {
    data: bookings,
    isFetching: fetchingTrips,
    refetch: refetchTrips,
  } = useGetBookingsQuery();
  const {
    data: methods,
    isFetching: fetchingMethods,
    refetch: refetchMethods,
  } = useGetPaymentMethodsQuery();
  // Only a pull shows the spinner; background refetches stay quiet.
  const [pulled, setPulled] = useState(false);
  const fetching = fetchingTrips || fetchingMethods;
  useEffect(() => {
    if (!fetching) {
      setPulled(false);
    }
  }, [fetching]);
  const [signOut, { isLoading: signingOut }] = useSignOutMutation();

  if (!user) {
    return <Screen top>{null}</Screen>;
  }

  const flown = (bookings ?? []).filter(
    booking => booking.status === BookingStatus.Confirmed,
  );
  const upcoming = flown.filter(booking => isUpcoming(booking, now)).length;
  const wallet = methods?.find(
    method => method.kind === PaymentMethodKind.Wallet,
  );
  const preferred = methods?.find(method => method.isDefault);

  const stats = [
    {
      label: t('profile.trips'),
      value: flown.length,
      format: (value: number) => String(value),
      testID: 'stat-trips',
    },
    {
      label: t('profile.upcoming'),
      value: upcoming,
      format: (value: number) => String(value),
      testID: 'stat-upcoming',
    },
    {
      label: t('profile.wallet'),
      value: wallet?.balance ?? 0,
      format: (value: number) =>
        value >= 100_000
          ? formatCompactMoney(value, wallet?.currency ?? 'AUD')
          : formatMoney(value, wallet?.currency ?? 'AUD'),
      testID: 'stat-wallet',
    },
  ];

  return (
    <Screen top>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: AppSpacing.tabContentInset(insets.bottom) },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={pulled && fetching}
            onRefresh={() => {
              setPulled(true);
              refetchTrips();
              refetchMethods();
            }}
            tintColor={palette.accent}
          />
        }
      >
        <View style={styles.header}>
          <Avatar
            testID="profile-avatar"
            name={user.fullName}
            size={84}
            ring={palette.accentSoft}
            ringWidth={4}
          />
          <View style={styles.identity}>
            <AppText testID="profile-name" variant="display">
              {user.fullName}
            </AppText>
            <AppText muted>{user.email}</AppText>
            <View style={styles.tierRow}>
              <StatusPill label={user.tier} tone={StatusTone.Inverse} />
              <AppText variant="caption" muted>
                {t('profile.memberSince', {
                  date: memberSince(user.memberSince, t.language),
                })}
              </AppText>
            </View>
          </View>
        </View>

        <Card style={styles.stats}>
          {stats.map((stat, index) => (
            <View
              key={stat.label}
              style={[styles.stat, index > 0 && styles.statDivider]}
            >
              <AppText testID={stat.testID} variant="title">
                {stat.format(stat.value)}
              </AppText>
              <AppText variant="caption" muted>
                {stat.label}
              </AppText>
            </View>
          ))}
        </Card>

        <View style={styles.section}>
          <AppText variant="label" muted>
            {t('profile.account')}
          </AppText>
          <Card style={styles.list}>
            <MenuRow
              testID="menu-personal"
              title={t('profile.personalInfo')}
              detail={`${user.fullName} · ${user.phone}`}
              onPress={onEditProfile}
            />
            <MenuRow
              testID="menu-payments"
              title={t('profile.paymentMethods')}
              detail={
                preferred
                  ? t('profile.defaultMethod', {
                      method: paymentLabel(preferred),
                    })
                  : undefined
              }
              onPress={onOpenPayments}
              last
            />
          </Card>
        </View>

        <View style={styles.section}>
          <AppText variant="label" muted>
            {t('profile.notifications')}
          </AppText>
          <Card style={styles.list}>
            {NOTIFICATIONS.map((item, index) => (
              <MenuRow
                key={item.key}
                title={t(item.title)}
                detail={t(item.detail)}
                last={index === NOTIFICATIONS.length - 1}
                trailing={
                  <Switch
                    testID={`notify-${item.key}`}
                    value={prefs[item.key]}
                    onValueChange={() => {
                      haptics.selection();
                      dispatch(notificationToggled(item.key));
                    }}
                    trackColor={{ false: palette.iron, true: palette.accent }}
                    thumbColor={AppColors.fixed.white}
                    ios_backgroundColor={palette.iron}
                  />
                }
              />
            ))}
          </Card>
        </View>

        <View style={styles.section}>
          <AppText variant="label" muted>
            {t('profile.preferences')}
          </AppText>
          <Card style={styles.list}>
            <MenuRow
              testID="menu-appearance"
              title={t('profile.appearance')}
              detail={t(THEME_LABELS[themeMode])}
              onPress={() => setPicking(PreferenceSheet.AppearancePicker)}
            />
            <MenuRow
              testID="menu-language"
              title={t('profile.language')}
              detail={t(`languages.${t.language}`)}
              onPress={() => setPicking(PreferenceSheet.LanguagePicker)}
              last
            />
          </Card>
        </View>

        <View style={styles.section}>
          <AppText variant="label" muted>
            {t('profile.support')}
          </AppText>
          <Card style={styles.list}>
            <MenuRow
              testID="menu-help"
              title={t('profile.help')}
              detail={t('profile.helpDetail')}
              onPress={onOpenHelp}
            />
            <MenuRow
              testID="menu-legal"
              title={t('profile.legal')}
              onPress={onOpenLegal}
              last
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Button
            testID="sign-out"
            title={t('profile.signOut')}
            variant={ButtonVariant.Danger}
            onPress={() => setConfirming(true)}
          />
          <AppText variant="caption" muted style={styles.version}>
            {t('profile.version', { app: APP_FULL_NAME, version: '1.0.0' })}
          </AppText>
        </View>
      </ScrollView>

      <BottomSheet
        visible={picking === PreferenceSheet.AppearancePicker}
        title={t('profile.appearance')}
        onClose={() => setPicking(null)}
        testID="appearance-sheet"
      >
        {THEME_MODES.map(mode => (
          <SheetOption
            key={mode}
            testID={`theme-mode-${mode}`}
            label={t(THEME_LABELS[mode])}
            selected={mode === themeMode}
            onPress={() => {
              haptics.selection();
              dispatch(themeModeSelected(mode));
              setPicking(null);
            }}
          />
        ))}
      </BottomSheet>

      <BottomSheet
        visible={picking === PreferenceSheet.LanguagePicker}
        title={t('profile.language')}
        onClose={() => setPicking(null)}
        testID="language-sheet"
      >
        {LANGUAGES.map(language => (
          <SheetOption
            key={language}
            testID={`language-${language}`}
            label={t(`languages.${language}`)}
            selected={language === t.language}
            onPress={() => {
              haptics.selection();
              dispatch(languageSelected(language));
              setPicking(null);
            }}
          />
        ))}
      </BottomSheet>

      <BottomSheet
        visible={confirming}
        title={t('profile.signOutTitle')}
        onClose={() => setConfirming(false)}
        testID="sign-out-sheet"
      >
        <View style={styles.sheet}>
          <AppText muted>{t('profile.signOutMessage')}</AppText>
          <Button
            testID="confirm-sign-out"
            title={t('profile.signOut')}
            variant={ButtonVariant.Danger}
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
  content: {
    padding: AppSpacing.lg,
    gap: AppSpacing.section,
  },
  header: {
    alignItems: 'center',
    gap: AppSpacing.md,
    paddingTop: AppSpacing.md,
  },
  identity: { alignItems: 'center', gap: AppSpacing.xs },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
    marginTop: AppSpacing.xs,
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: AppSpacing.lg,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: palette.iron },
  section: { gap: AppSpacing.sm },
  list: { paddingVertical: 0 },
  version: { textAlign: 'center', marginTop: AppSpacing.md },
  sheet: { gap: AppSpacing.md, paddingTop: AppSpacing.sm },
}));
