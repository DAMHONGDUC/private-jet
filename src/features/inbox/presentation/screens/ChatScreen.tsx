import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition, ZoomIn, ZoomOut } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { blackJetFonts, makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { BJText } from '@/core/ui/BJText';
import { Chip } from '@/core/ui/Chip';
import { PressableScale } from '@/core/ui/PressableScale';
import { Screen } from '@/core/ui/Screen';
import { ErrorView, LoadingView, errorMessage } from '@/core/ui/StateViews';
import { haptics } from '@/core/ui/haptics';
import { cleanMessage, type ChatMessage } from '../../domain/entities/inbox';
import { TypingDots } from '../components/TypingDots';
import { useGetMessagesQuery, useMarkMessagesReadMutation, useSendMessageMutation } from '../inbox-api';
import { clockTime } from '../inbox-labels';

export const QUICK_REPLIES = ['Arrange catering', 'Book a chauffeur', 'Bring my dog', 'Change a trip'];

/** The conversation with the member's concierge: bubbles, quick replies, and a reply that is typed for a moment. */
export function ChatScreen() {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const insets = useSafeAreaInsets();
  const { data: messages, error, isLoading, refetch } = useGetMessagesQuery();
  const [sendMessage, { isLoading: waiting, error: sendError }] = useSendMessageMutation();
  const [markRead] = useMarkMessagesReadMutation();
  const [draft, setDraft] = useState('');
  const list = useRef<FlatList<ChatMessage>>(null);

  const hasUnread = messages?.some(message => !message.read) ?? false;
  useEffect(() => {
    if (hasUnread) {
      markRead();
    }
  }, [hasUnread, markRead]);

  // Inverted, so the newest sits at the bottom and the list opens there.
  const newestFirst = useMemo(() => [...(messages ?? [])].reverse(), [messages]);

  if (isLoading) {
    return (
      <Screen>
        <LoadingView />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen>
        <ErrorView error={error} onRetry={refetch} />
      </Screen>
    );
  }

  const send = (text: string) => {
    const message = cleanMessage(text);
    if (!message || waiting) {
      return;
    }
    haptics.light();
    setDraft('');
    list.current?.scrollToOffset({ offset: 0, animated: true });
    sendMessage(message)
      .unwrap()
      .then(() => haptics.selection())
      .catch(() => {
        haptics.error();
        setDraft(message);
      });
  };

  const canSend = cleanMessage(draft) !== null && !waiting;

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={list}
          testID="chat-list"
          inverted
          data={newestFirst}
          keyExtractor={message => message.id}
          contentContainerStyle={styles.list}
          keyboardDismissMode="interactive"
          ListHeaderComponent={
            <View style={styles.footerSlot}>
              {waiting ? (
                <Animated.View entering={FadeIn.duration(200)}>
                  <TypingDots testID="typing" />
                </Animated.View>
              ) : null}
            </View>
          }
          ListFooterComponent={
            <Animated.View entering={FadeInDown.duration(500)} style={styles.intro}>
              <View style={styles.conciergeAvatar}>
                <BJText size={22} weight="bold" tone="white">
                  S
                </BJText>
                <View style={styles.online} />
              </View>
              <AppText variant="subtitle">Sophie Laurent</AppText>
              <AppText variant="caption" muted>
                Your BlackJet concierge · usually replies in minutes
              </AppText>
            </Animated.View>
          }
          renderItem={({ item }) => <Bubble message={item} />}
        />

        {sendError ? (
          <AppText testID="chat-error" variant="caption" style={styles.error}>
            {errorMessage(sendError)}
          </AppText>
        ) : null}

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
              onPress={() => send(reply)}
            />
          ))}
        </ScrollView>

        <View style={[styles.composer, { paddingBottom: insets.bottom + spacing.sm }]}>
          <TextInput
            testID="chat-input"
            style={styles.input}
            placeholder="Message your concierge"
            placeholderTextColor={palette.secondaryText}
            multiline
            value={draft}
            onChangeText={setDraft}
          />
          {canSend ? (
            <Animated.View entering={ZoomIn.springify().damping(14)} exiting={ZoomOut.duration(150)}>
              <PressableScale
                testID="chat-send"
                accessibilityRole="button"
                accessibilityLabel="Send"
                scaleTo={0.9}
                onPress={() => send(draft)}
                style={styles.send}
              >
                <BJText size={20} weight="bold" tone="inverse">
                  ↑
                </BJText>
              </PressableScale>
            </Animated.View>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const styles = useStyles();
  const mine = message.author === 'member';
  return (
    <Animated.View
      testID={`message-${message.id}`}
      entering={FadeIn.duration(300)}
      layout={LinearTransition.duration(250)}
      style={[styles.bubbleRow, mine ? styles.mineRow : styles.theirsRow]}
    >
      <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
        <AppText style={mine ? styles.mineText : undefined}>{message.text}</AppText>
      </View>
      <AppText variant="caption" muted style={styles.time}>
        {clockTime(message.sentAt)}
      </AppText>
    </Animated.View>
  );
}

const useStyles = makeStyles(palette => ({
  flex: { flex: 1 },
  list: { padding: spacing.lg, gap: spacing.md },
  footerSlot: { minHeight: 8 },
  intro: { alignItems: 'center', gap: 4, paddingVertical: spacing.lg },
  conciergeAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1C1C',
    marginBottom: spacing.sm,
  },
  online: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: palette.success,
    borderWidth: 2,
    borderColor: palette.secondaryBackground,
  },
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
  error: { color: palette.error, textAlign: 'center', paddingBottom: spacing.xs },
  quickBar: { flexGrow: 0 },
  quick: { gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: palette.iron,
    backgroundColor: palette.secondaryBackground,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
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
