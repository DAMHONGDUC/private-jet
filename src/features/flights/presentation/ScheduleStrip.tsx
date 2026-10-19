import { View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Icon } from '@/core/ui/Icon';
import { formatDuration } from '@/core/utils/format';
import type { FlightSchedule } from '../domain/entities/schedule';
import { formatArrival } from './schedule-labels';

type Props = {
  schedule: FlightSchedule;
  origin: string;
  destination: string;
  durationMinutes: number;
  testID?: string;
};

/** Departs on the left, lands on the right, the flight time on the line between; all estimated, in local times. */
export function ScheduleStrip({
  schedule,
  origin,
  destination,
  durationMinutes,
  testID,
}: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const t = useT();
  return (
    <View testID={testID} style={styles.strip}>
      <View style={styles.row}>
        <View style={styles.end}>
          <AppText variant="caption" muted>
            {t('results.departs')}
          </AppText>
          <AppText variant="display">{schedule.departs}</AppText>
          <AppText variant="caption" muted>
            {origin}
          </AppText>
        </View>
        <View style={styles.middle}>
          <AppText variant="caption" muted>
            {formatDuration(durationMinutes)}
          </AppText>
          <View style={styles.line}>
            <View style={styles.rule} />
            <Icon name="plane" size={16} color={palette.accent} />
            <View style={styles.rule} />
          </View>
        </View>
        <View style={[styles.end, styles.right]}>
          <AppText variant="caption" muted>
            {t('results.lands')}
          </AppText>
          <AppText variant="display">{formatArrival(schedule)}</AppText>
          <AppText variant="caption" muted>
            {destination}
          </AppText>
        </View>
      </View>
      <AppText variant="caption" muted>
        {t('results.estimatedLocal')}
      </AppText>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  strip: {
    gap: AppSpacing.spacing12,
    padding: AppSpacing.spacing16,
    borderRadius: radius.lg,
    backgroundColor: palette.primaryBackground,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  end: { gap: AppSpacing.spacing4 },
  right: { alignItems: 'flex-end' },
  middle: {
    flex: 1,
    alignItems: 'center',
    gap: AppSpacing.spacing4,
    paddingHorizontal: AppSpacing.spacing12,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: AppSpacing.spacing8,
  },
  rule: { flex: 1, height: 1, backgroundColor: palette.iron },
}));
