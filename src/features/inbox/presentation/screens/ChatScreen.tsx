import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Screen } from '@/core/ui/Screen';
import { errorMessage } from '@/core/error/error-message';
import { ErrorView } from '@/core/ui/ErrorView';
import { LoadingView } from '@/core/ui/LoadingView';
import { haptics } from '@/core/ui/haptics';
import { cleanMessage, type ChatMessage } from '../../domain/entities/inbox';
import { ChatBubble } from '../components/ChatBubble';
import { ChatComposer } from '../components/ChatComposer';
import { ConciergeIntro } from '../components/ConciergeIntro';
import { QuickReplies } from '../components/QuickReplies';
import { TypingDots } from '../components/TypingDots';
import {
  useGetMessagesQuery,
  useMarkMessagesReadMutation,
  useSendMessageMutation,
} from '../inbox-api';

/**
 * How often the open conversation asks for new messages. The mock answers
 * inside the send call; a real concierge answers later, and this is how the
 * reply shows up. A push channel (WebSocket, push notification) can replace
 * it later through `onCacheEntryAdded` on `getMessages`.
 */
export const CHAT_POLL_MS = 5_000;

/** The conversation with the member's concierge: bubbles, quick replies, and a reply that is typed for a moment. */
export function ChatScreen() {
  const styles = useStyles();
  const [sendMessage, { isLoading: waiting, error: sendError }] =
    useSendMessageMutation();
  // Paused while a message sends, so a poll cannot drop its pending bubble;
  // RTK Query stops polling when the screen unmounts or the app is in the background.
  const {
    data: messages,
    error,
    isLoading,
    refetch,
  } = useGetMessagesQuery(undefined, {
    pollingInterval: waiting ? 0 : CHAT_POLL_MS,
    skipPollingIfUnfocused: true,
  });
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
  const newestFirst = useMemo(
    () => [...(messages ?? [])].reverse(),
    [messages],
  );

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
          ListFooterComponent={<ConciergeIntro />}
          renderItem={({ item }) => <ChatBubble message={item} />}
        />

        {sendError ? (
          <AppText testID="chat-error" variant="caption" style={styles.error}>
            {errorMessage(sendError)}
          </AppText>
        ) : null}

        <QuickReplies onPick={send} />

        <ChatComposer
          value={draft}
          onChangeText={setDraft}
          canSend={canSend}
          onSend={() => send(draft)}
        />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = makeStyles(palette => ({
  flex: { flex: 1 },
  list: { padding: AppSpacing.spacing16, gap: AppSpacing.spacing12 },
  footerSlot: { minHeight: 8 },
  error: {
    color: palette.error,
    textAlign: 'center',
    paddingBottom: AppSpacing.spacing4,
  },
}));
