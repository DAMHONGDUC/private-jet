import { TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppSpacing } from '@/core/theme/app-spacing';
import {
  blackJetFonts,
  makeStyles,
  useBlackJetTheme,
} from '@/core/theme/blackjet';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  /** The send button shows only while there is something to send. */
  canSend: boolean;
  onSend: () => void;
};

/** The message box pinned under the chat, with its round send button. */
export function ChatComposer({ value, onChangeText, canSend, onSend }: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.composer,
        { paddingBottom: insets.bottom + AppSpacing.spacing8 },
      ]}
    >
      <TextInput
        testID="chat-input"
        style={styles.input}
        placeholder="Message your concierge"
        placeholderTextColor={palette.secondaryText}
        multiline
        value={value}
        onChangeText={onChangeText}
      />
      {canSend ? (
        <View>
          <PressableScale
            testID="chat-send"
            accessibilityRole="button"
            accessibilityLabel="Send"
            scaleTo={0.9}
            onPress={onSend}
            style={styles.send}
          >
            <BJText size={20} weight="medium" tone="inverse">
              ↑
            </BJText>
          </PressableScale>
        </View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: AppSpacing.spacing8,
    paddingHorizontal: AppSpacing.spacing16,
    paddingTop: AppSpacing.spacing8,
    borderTopWidth: 1,
    borderTopColor: palette.iron,
    backgroundColor: palette.secondaryBackground,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: AppSpacing.spacing12,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: palette.iron,
    backgroundColor: palette.primaryBackground,
    color: palette.primaryText,
    fontFamily: blackJetFonts.regular,
    fontSize: 15,
  },
  send: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.jetBlack,
  },
}));
