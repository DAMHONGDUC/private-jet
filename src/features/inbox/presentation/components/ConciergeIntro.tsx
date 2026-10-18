import { View } from 'react-native';
import { AppColors } from '@/core/theme/app-colors';
import { AppSpacing } from '@/core/theme/app-spacing';
import { makeStyles } from '@/core/theme/blackjet';
import { AppText } from '@/core/ui/AppText';
import { BJText } from '@/core/ui/BJText';

/** The top of the chat: the concierge's avatar, online dot and name. */
export function ConciergeIntro() {
  const styles = useStyles();
  return (
    <View style={styles.intro}>
      <View style={styles.conciergeAvatar}>
        <BJText size={20} weight="medium" tone="white">
          S
        </BJText>
        <View style={styles.online} />
      </View>
      <AppText variant="subtitle">Sophie Laurent</AppText>
      <AppText variant="caption" muted>
        Your Sovereign concierge · usually replies in minutes
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  intro: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: AppSpacing.spacing16,
  },
  conciergeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AppColors.fixed.photoBackdrop,
    marginBottom: AppSpacing.spacing8,
  },
  online: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.success,
    borderWidth: 2,
    borderColor: palette.secondaryBackground,
  },
}));
