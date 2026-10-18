import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';

/** A titled card on the trip page: itinerary, passengers, payment. */
export function TripSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View>
      <Card style={styles.section}>
        <AppText variant="subtitle">{title}</AppText>
        {children}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: AppSpacing.spacing12 },
});
