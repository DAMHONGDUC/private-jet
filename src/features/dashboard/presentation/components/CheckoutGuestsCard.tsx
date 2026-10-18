import { StyleSheet } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';
import type { TravellerErrors } from '@/features/booking/domain/entities/booking';
import { FormField } from '@/features/booking/presentation/components/FormField';

type Props = {
  /** Seats the party needs, the largest leg's passenger count. */
  party: number;
  names: string[];
  email: string;
  notes: string;
  errors: TravellerErrors;
  onNameChange: (index: number, name: string) => void;
  onEmailChange: (email: string) => void;
  onNotesChange: (notes: string) => void;
};

/** The party at checkout: a name per guest, the contact email and requests. */
export function CheckoutGuestsCard({
  party,
  names,
  email,
  notes,
  errors,
  onNameChange,
  onEmailChange,
  onNotesChange,
}: Props) {
  return (
    <Card style={styles.section}>
      <AppText variant="subtitle">Guests · {party}</AppText>
      {names.map((name, index) => (
        <FormField
          key={index}
          testID={`charter-passenger-${index}`}
          label={index === 0 ? 'Lead guest' : `Guest ${index + 1}`}
          placeholder="Full name as on passport"
          autoCapitalize="words"
          value={name}
          error={errors.names[index]}
          onChangeText={text => onNameChange(index, text)}
        />
      ))}
      <FormField
        testID="charter-email"
        label="Contact email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        value={email}
        onChangeText={onEmailChange}
        error={errors.contactEmail}
      />
      <FormField
        testID="charter-notes"
        label="Special requests (optional)"
        placeholder="Catering, pets, ground transport…"
        multiline
        value={notes}
        onChangeText={onNotesChange}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  section: { gap: AppSpacing.spacing12 },
});
