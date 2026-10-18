import { StyleSheet, View } from 'react-native';
import {
  blackJetFonts,
  makeStyles,
  useBlackJetTheme,
} from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Icon } from '@/core/ui/Icon';
import { formatMoney } from '@/core/utils/format';
import { firstLeg, lastLeg, type Booking } from '../../domain/entities/booking';
import { departureLabel, kindLabel, routeCodes } from '../trip-labels';
import { BoardingDetail } from './BoardingDetail';

const NOTCH = 20;

/**
 * The booking as a boarding pass: the route in large serif codes, a
 * perforation, then the details and the reference. Shown once, when the
 * trip is booked.
 */
export function BoardingPass({ booking }: { booking: Booking }) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const from = firstLeg(booking);
  const to = lastLeg(booking);
  const guests = booking.passengers.length;

  return (
    <View testID="boarding-pass" style={styles.pass}>
      <View style={styles.top}>
        <View style={styles.row}>
          <AppText variant="label" muted>
            {kindLabel(booking)}
          </AppText>
          {booking.legs.length > 2 ? (
            <AppText variant="caption" muted>
              {routeCodes(booking)}
            </AppText>
          ) : null}
        </View>
        <View style={styles.route}>
          <View>
            <AppText style={styles.code}>{from.originCode}</AppText>
            <AppText variant="caption" muted>
              {from.originCity}
            </AppText>
          </View>
          <View style={styles.path}>
            <View style={[styles.line, { backgroundColor: palette.iron }]} />
            <Icon name="plane" size={18} color={palette.accent} />
            <View style={[styles.line, { backgroundColor: palette.iron }]} />
          </View>
          <View style={styles.end}>
            <AppText style={styles.code}>{to.destinationCode}</AppText>
            <AppText variant="caption" muted>
              {to.destinationCity}
            </AppText>
          </View>
        </View>
      </View>

      <View style={styles.perforation}>
        <View style={[styles.notch, styles.notchStart]} />
        <View style={styles.dashes} />
        <View style={[styles.notch, styles.notchEnd]} />
      </View>

      <View style={styles.bottom}>
        <View style={styles.grid}>
          <BoardingDetail label="Departure" value={departureLabel(booking)} />
          <BoardingDetail label="Guests" value={String(guests)} />
          <BoardingDetail label="Paid with" value={booking.paymentLabel} />
          <BoardingDetail
            label="Total"
            value={formatMoney(booking.totalPrice, booking.currency)}
          />
        </View>
        <View style={styles.reference}>
          <AppText variant="label" muted>
            Reference
          </AppText>
          <AppText testID="booking-reference" style={styles.referenceCode}>
            {booking.reference}
          </AppText>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  pass: {
    alignSelf: 'stretch',
    backgroundColor: palette.cardBackground,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.iron,
    overflow: 'hidden',
  },
  top: { padding: AppSpacing.card, gap: AppSpacing.lg },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  route: { flexDirection: 'row', alignItems: 'center', gap: AppSpacing.md },
  code: {
    fontFamily: blackJetFonts.display,
    fontSize: 36,
    lineHeight: 42,
    color: palette.primaryText,
    letterSpacing: 1,
  },
  path: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: AppSpacing.sm,
  },
  line: { flex: 1, height: StyleSheet.hairlineWidth },
  end: { alignItems: 'flex-end' },
  perforation: { flexDirection: 'row', alignItems: 'center', height: NOTCH },
  // Circles in the screen colour bite into the pass at the tear line.
  notch: {
    width: NOTCH,
    height: NOTCH,
    borderRadius: NOTCH / 2,
    backgroundColor: palette.secondaryBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: palette.iron,
  },
  notchStart: { marginLeft: -NOTCH / 2 },
  notchEnd: { marginRight: -NOTCH / 2 },
  dashes: {
    flex: 1,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: palette.iron,
    marginHorizontal: AppSpacing.sm,
  },
  bottom: { padding: AppSpacing.card, gap: AppSpacing.lg },
  grid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: AppSpacing.md },
  reference: { alignItems: 'center', gap: AppSpacing.xs },
  referenceCode: {
    fontFamily: blackJetFonts.display,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 6,
    color: palette.primaryText,
  },
}));
