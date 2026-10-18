import { StyleSheet, View } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import type { Booking } from '../../domain/entities/booking';
import { TripSection } from './TripSection';

type Props = { booking: Booking };

/** The trip's party, lead guest first, and the contact email. */
export function TripGuests({ booking }: Props) {
  return (
    <TripSection title={`Guests · ${booking.passengers.length}`}>
      {booking.passengers.map((passenger, index) => (
        <View key={`${passenger.fullName}-${index}`} style={styles.line}>
          <AppText>{passenger.fullName}</AppText>
          <AppText variant="caption" muted>
            {index === 0 ? 'Lead guest' : `Guest ${index}`}
          </AppText>
        </View>
      ))}
      <View style={styles.line}>
        <AppText muted>Contact</AppText>
        <AppText>{booking.contactEmail}</AppText>
      </View>
    </TripSection>
  );
}

const styles = StyleSheet.create({
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: AppSpacing.md,
  },
});
