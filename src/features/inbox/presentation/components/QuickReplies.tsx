import { ScrollView, StyleSheet } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { Chip } from '@/core/ui/Chip';

export const QUICK_REPLIES = [
  'Arrange catering',
  'Book a chauffeur',
  'Bring my dog',
  'Change a trip',
];

type Props = { onPick: (reply: string) => void };

/** A sideways row of ready-made requests above the composer; tapping one sends it. */
export function QuickReplies({ onPick }: Props) {
  return (
    <ScrollView
      horizontal
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.quick}
      style={styles.quickBar}
    >
      {QUICK_REPLIES.map((reply, index) => (
        <Chip
          key={reply}
          testID={`quick-reply-${index}`}
          label={reply}
          selected={false}
          onPress={() => onPick(reply)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // A ScrollView shrinks by default; with the keyboard up it squashed the
  // chips below their text. Only the message list gives up height.
  quickBar: { flexGrow: 0, flexShrink: 0 },
  quick: {
    gap: AppSpacing.spacing8,
    paddingHorizontal: AppSpacing.spacing16,
    paddingVertical: AppSpacing.spacing8,
  },
});
