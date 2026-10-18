import { View } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { TypingDot } from './TypingDot';

/** Three dots that rise in turn while the concierge writes. */
export function TypingDots({ testID }: { testID?: string }) {
  const styles = useStyles();
  return (
    <View
      testID={testID}
      accessibilityLabel="Concierge is typing"
      style={styles.bubble}
    >
      {[0, 1, 2].map(index => (
        <TypingDot key={index} index={index} />
      ))}
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  bubble: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    backgroundColor: palette.primaryBackground,
    borderWidth: 1,
    borderColor: palette.iron,
  },
}));
