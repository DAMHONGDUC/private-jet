import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { typeScale } from '@/core/theme/theme';
import { BJText } from '@/core/ui/BJText';
import { initialsOf } from '@/features/auth/domain/entities/user';

type Props = {
  name: string;
  size: number;
  ring?: string;
  ringWidth?: number;
  testID?: string;
};

/** The largest text size that fits a circle this big. */
const initialsSize = (size: number) =>
  size >= 72
    ? typeScale.display
    : size >= 48
    ? typeScale.title
    : size >= 36
    ? typeScale.body
    : typeScale.caption;

/** The member's initials in a circle, as the original shows before a photo is set. */
export function Avatar({ name, size, ring, ringWidth = 1, testID }: Props) {
  const palette = useBlackJetTheme();
  const shape = { width: size, height: size, borderRadius: size / 2 };
  const border = ring ? { borderWidth: ringWidth, borderColor: ring } : null;
  return (
    <View
      testID={testID}
      style={[styles.base, { backgroundColor: palette.accent }, shape, border]}
    >
      <BJText size={initialsSize(size)} tone="onAccent">
        {initialsOf(name)}
      </BJText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
});
