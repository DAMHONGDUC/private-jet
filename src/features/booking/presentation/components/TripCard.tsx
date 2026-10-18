import { StyleSheet, View } from 'react-native';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { StatusPill } from '@/core/ui/StatusPill';
import { formatMoney } from '@/core/utils/format';
import {
  BookingStatus,
  firstLeg,
  lastLeg,
  type Booking,
} from '../../domain/entities/booking';
import { departureLabel, kindLabel, tripState } from '../trip-labels';

type Props = { booking: Booking; now: Date; onPress: () => void };

const NOTCH = 18;

/** A boarding pass: route on top, a perforated tear line, then date, party and price. */
export function TripCard({ booking, now, onPress }: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const from = firstLeg(booking);
  const to = lastLeg(booking);
  const state = tripState(booking, now);
  const faded = booking.status === BookingStatus.Cancelled;

  return (
    <PressableScale
      testID={`trip-${booking.reference}`}
      accessibilityRole="button"
      accessibilityLabel={`${from.originCity} to ${to.destinationCity}, ${state.label}`}
      onPress={onPress}
      style={[styles.card, faded && styles.faded]}
    >
      <View style={styles.top}>
        <View style={styles.row}>
          <AppText variant="label" muted>
            {kindLabel(booking)}
          </AppText>
          <StatusPill label={state.label} tone={state.tone} />
        </View>
        <View style={styles.route}>
          <View>
            <AppText variant="display">{from.originCode}</AppText>
            <AppText variant="caption" muted>
              {from.originCity}
            </AppText>
          </View>
          <View style={styles.path}>
            <View style={styles.dash} />
            <Icon name="plane" size={20} color={palette.accent} />
            <View style={styles.dash} />
          </View>
          <View style={styles.end}>
            <AppText variant="display">{to.destinationCode}</AppText>
            <AppText variant="caption" muted>
              {to.destinationCity}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.tear}>
        <View style={[styles.notch, styles.notchLeft]} />
        <View style={styles.perforation} />
        <View style={[styles.notch, styles.notchRight]} />
      </View>

      <View style={styles.bottom}>
        <View style={[styles.cell, styles.wide]}>
          <AppText variant="caption" muted>
            Departure
          </AppText>
          <AppText variant="subtitle">{departureLabel(booking)}</AppText>
        </View>
        <View style={styles.cell}>
          <AppText variant="caption" muted>
            Ref
          </AppText>
          <AppText variant="subtitle">{booking.reference}</AppText>
        </View>
        <View style={[styles.cell, styles.end]}>
          <AppText variant="caption" muted>
            {booking.passengers.length} pax
          </AppText>
          <AppText variant="subtitle">
            {formatMoney(booking.totalPrice, booking.currency)}
          </AppText>
        </View>
      </View>
    </PressableScale>
  );
}

const useStyles = makeStyles(palette => ({
  card: {
    backgroundColor: palette.cardBackground,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.iron,
    overflow: 'hidden',
  },
  faded: { opacity: 0.6 },
  top: { padding: AppSpacing.spacing16, gap: AppSpacing.spacing12 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  route: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.spacing12,
  },
  path: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dash: {
    flex: 1,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.ashGrey,
  },
  end: { alignItems: 'flex-end' },
  tear: { height: NOTCH, justifyContent: 'center' },
  perforation: {
    marginHorizontal: NOTCH,
    height: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.ashGrey,
  },
  notch: {
    position: 'absolute',
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: palette.secondaryBackground,
  },
  notchLeft: { left: -NOTCH / 2 },
  notchRight: { right: -NOTCH / 2 },
  bottom: {
    flexDirection: 'row',
    padding: AppSpacing.spacing16,
    paddingTop: AppSpacing.spacing8,
    gap: AppSpacing.spacing12,
  },
  cell: { flex: 1, gap: 2 },
  wide: { flex: 1.8 },
}));
