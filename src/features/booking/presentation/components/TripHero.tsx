import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';
import { FlightPath } from '@/core/ui/FlightPath';
import { StatusPill } from '@/core/ui/StatusPill';
import { firstLeg, lastLeg, type Booking } from '../../domain/entities/booking';
import { kindLabel, type TripState } from '../trip-labels';

type Props = { booking: Booking; state: TripState };

/** The top of the trip page: kind and status, the two airports and the booking reference. */
export function TripHero({ booking, state }: Props) {
  const styles = useStyles();
  const from = firstLeg(booking);
  const to = lastLeg(booking);

  return (
    <View>
      <Card style={styles.hero}>
        <View style={styles.row}>
          <AppText variant="label" muted>
            {kindLabel(booking)}
          </AppText>
          <Animated.View key={state.label} entering={FadeIn.duration(250)}>
            <StatusPill
              testID="trip-status"
              label={state.label}
              tone={state.tone}
            />
          </Animated.View>
        </View>
        <View style={styles.row}>
          <View>
            <AppText variant="display">{from.originCode}</AppText>
            <AppText muted>{from.originCity}</AppText>
          </View>
          <View style={styles.end}>
            <AppText variant="display">{to.destinationCode}</AppText>
            <AppText muted>{to.destinationCity}</AppText>
          </View>
        </View>
        <FlightPath />
        <View style={styles.reference}>
          <AppText variant="caption" muted>
            Booking reference
          </AppText>
          <AppText testID="trip-reference" variant="title" style={styles.code}>
            {booking.reference}
          </AppText>
        </View>
      </Card>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  hero: { gap: AppSpacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  end: { alignItems: 'flex-end' },
  reference: {
    alignItems: 'center',
    paddingVertical: AppSpacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.ashGrey,
    gap: 2,
  },
  code: { letterSpacing: 4 },
}));
