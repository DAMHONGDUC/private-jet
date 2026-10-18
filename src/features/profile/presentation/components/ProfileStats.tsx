import { View } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';

export type ProfileStat = {
  label: string;
  value: number;
  format: (value: number) => string;
  testID: string;
};

/** Trips, upcoming and wallet side by side, split by thin rules. */
export function ProfileStats({ stats }: { stats: ProfileStat[] }) {
  const styles = useStyles();
  return (
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
  );
}

const useStyles = makeStyles(palette => ({
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 0,
    paddingVertical: AppSpacing.lg,
  },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { borderLeftWidth: 1, borderLeftColor: palette.iron },
}));
