import { ScrollView, StyleSheet, View } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Screen } from '@/core/ui/Screen';

/** Placeholder text for terms and privacy; the demo has no legal entity behind it. */
export function LegalScreen() {
  const sections = [
    [
      'Demo build',
      'Sovereign is a demonstration app. Flights, bookings, payments and messages are simulated on the device; nothing is charged and no aircraft is reserved.',
    ],
    [
      'Your data',
      'The profile, trips and cards you add live in memory for this session only and are reset when the app restarts. Nothing is sent to a server.',
    ],
    [
      'Cancellations',
      'Bookings cancel free of charge until 24 hours before the first departure. After that the fare is kept.',
    ],
    [
      'Contact',
      'Questions about this demo go to the developer who shared it with you.',
    ],
  ];
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {sections.map(([title, body]) => (
          <View key={title} style={styles.legal}>
            <AppText variant="subtitle">{title}</AppText>
            <AppText muted>{body}</AppText>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: AppSpacing.spacing16,
    gap: AppSpacing.spacing16,
    paddingBottom: AppSpacing.spacing32,
  },
  legal: { gap: AppSpacing.spacing4 },
});
