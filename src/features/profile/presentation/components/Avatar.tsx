import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { initialsOf } from '@/features/auth/domain/entities/user';

type Props = { name: string; size: number; ring?: string; ringWidth?: number; testID?: string };

/** The member's initials in a circle, as the original shows before a photo is set. */
export function Avatar({ name, size, ring, ringWidth = 1, testID }: Props) {
  const palette = useBlackJetTheme();
  const shape = { width: size, height: size, borderRadius: size / 2 };
  const face = palette.scheme === 'dark' ? styles.dark : styles.light;
  const border = ring ? { borderWidth: ringWidth, borderColor: ring } : null;
  return (
    <View testID={testID} style={[styles.base, face, shape, border]}>
      <BJText size={size * 0.36} weight="bold" tone="white">
        {initialsOf(name)}
      </BJText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center' },
  light: { backgroundColor: '#1C1C1C' },
  dark: { backgroundColor: '#2B2B2B' },
});
