import { StyleSheet, Text } from 'react-native';

/** Glyphs from the bundled icon fonts (feature-docs/dashboard §1.4). */
const GLYPHS = {
  chat: { family: 'BlackJet_Custom_Icons', code: 0xe82f },
  bell: { family: 'BlackJet_Custom_Icons', code: 0xe805 },
  home: { family: 'BlackJet_Custom_Icons', code: 0xe817 },
  plane: { family: 'BlackJet_Custom_Icons', code: 0xe814 },
  ticket: { family: 'BlackJet_Custom_Icons', code: 0xe812 },
  closeCircle: { family: 'BlackJet_Custom_Icons', code: 0xe807 },
  calendar: { family: 'BlackJet_NewIcons', code: 0xe85f },
  add: { family: 'MaterialIcons-Regular', code: 0xe047 },
  swap: { family: 'MaterialIcons-Regular', code: 0xf01fa },
  family: { family: 'MaterialIcons-Regular', code: 0xf046 },
  close: { family: 'MaterialIcons-Regular', code: 0xf647 },
  search: { family: 'MaterialIcons-Regular', code: 0xec5e },
  clear: { family: 'MaterialIcons-Regular', code: 0xe168 },
  minus: { family: 'MaterialIcons-Regular', code: 0xf00f1 },
  plus: { family: 'MaterialIcons-Regular', code: 0xf537 },
} as const;

export type IconName = keyof typeof GLYPHS;

type Props = { name: IconName; size: number; color: string; testID?: string };

export function Icon({ name, size, color, testID }: Props) {
  const glyph = GLYPHS[name];
  return (
    <Text
      testID={testID}
      accessible={false}
      allowFontScaling={false}
      style={[styles.icon, { fontFamily: glyph.family, fontSize: size, lineHeight: size, color }]}
    >
      {String.fromCodePoint(glyph.code)}
    </Text>
  );
}

const styles = StyleSheet.create({
  icon: { includeFontPadding: false, textAlign: 'center' },
});
