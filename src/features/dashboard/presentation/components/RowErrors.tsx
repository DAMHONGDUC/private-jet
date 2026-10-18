import { StyleSheet, View } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { FieldError } from '@/core/ui/FieldError';

/** The problems of one row of fields, one line each, right under the row. */
export function RowErrors({
  messages,
  testID,
}: {
  messages: (string | undefined)[];
  testID: string;
}) {
  const shown = messages.filter((message): message is string => !!message);
  if (shown.length === 0) {
    return null;
  }
  return (
    <View testID={testID} style={styles.rowErrors}>
      {shown.map(message => (
        <FieldError key={message} message={message} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rowErrors: { gap: 2, marginTop: -AppSpacing.xs },
});
