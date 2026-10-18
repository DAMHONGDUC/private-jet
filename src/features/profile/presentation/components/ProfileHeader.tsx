import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { StatusPill, StatusTone } from '@/core/ui/StatusPill';
import type { User } from '@/features/auth/domain/entities/user';
import { Avatar } from './Avatar';

type Props = {
  user: User;
  /** Already worded for the app's language, e.g. "March 2021". */
  memberSince: string;
};

/** The member at the top of the profile: avatar, name, email, tier and since when. */
export function ProfileHeader({ user, memberSince }: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  return (
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
            {t('profile.memberSince', { date: memberSince })}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
