import { View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { makeStyles } from '@/core/theme/blackjet';
import { AppText } from '@/core/ui/AppText';
import { MessageAuthor, type ChatMessage } from '../../domain/entities/inbox';
import { clockTime } from '../inbox-labels';

/** One message: the member's on the right in black, the concierge's on the left. */
export function ChatBubble({ message }: { message: ChatMessage }) {
  const styles = useStyles();
  const mine = message.author === MessageAuthor.Member;
  return (
    <Animated.View
      testID={`message-${message.id}`}
      entering={FadeIn.duration(300)}
      style={[styles.bubbleRow, mine ? styles.mineRow : styles.theirsRow]}
    >
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <AppText style={mine ? styles.mineText : undefined}>
          {message.text}
        </AppText>
      </View>
      <AppText variant="caption" muted style={styles.time}>
        {clockTime(message.sentAt)}
      </AppText>
    </Animated.View>
  );
}

const useStyles = makeStyles(palette => ({
  bubbleRow: { maxWidth: '82%', gap: 2 },
  mineRow: { alignSelf: 'flex-end', alignItems: 'flex-end' },
  theirsRow: { alignSelf: 'flex-start', alignItems: 'flex-start' },
  bubble: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  mine: { backgroundColor: palette.jetBlack, borderBottomRightRadius: 4 },
  mineText: { color: palette.ghostWhite },
  theirs: {
    backgroundColor: palette.primaryBackground,
    borderWidth: 1,
    borderColor: palette.iron,
    borderBottomLeftRadius: 4,
  },
  time: { fontSize: 11, paddingHorizontal: 4 },
}));
