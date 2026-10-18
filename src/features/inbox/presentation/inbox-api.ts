import { runQuery } from '@/core/query/run-query';
import { baseApi } from '@/core/store/base-api';
import {
  MessageAuthor,
  type AppNotification,
  type ChatMessage,
  type InboxSummary,
} from '../domain/entities/inbox';
import type {
  GetInboxSummary,
  GetMessages,
  GetNotifications,
  MarkMessagesRead,
  MarkNotificationRead,
  SendMessage,
} from '../domain/usecases/inbox';

export type InboxDependencies = {
  getInboxSummary: GetInboxSummary;
  getNotifications: GetNotifications;
  markNotificationRead: MarkNotificationRead;
  getMessages: GetMessages;
  sendMessage: SendMessage;
  markMessagesRead: MarkMessagesRead;
};

const deps = (extra: unknown) => extra as InboxDependencies;

/** A member message shown before the mock backend has it; replaced by the real thread when it answers. */
export const PENDING_MESSAGE_ID = 'pending';

export const inboxApi = baseApi.injectEndpoints({
  endpoints: build => ({
    getInboxSummary: build.query<InboxSummary, void>({
      queryFn: (_arg, { extra }) =>
        runQuery(() => deps(extra).getInboxSummary.execute()),
      providesTags: ['Notification', 'Message'],
    }),
    getNotifications: build.query<AppNotification[], void>({
      queryFn: (_arg, { extra }) =>
        runQuery(() => deps(extra).getNotifications.execute()),
      providesTags: ['Notification'],
    }),
    /** No id marks them all. */
    markNotificationRead: build.mutation<AppNotification[], string | undefined>(
      {
        queryFn: (id, { extra }) =>
          runQuery(() => deps(extra).markNotificationRead.execute(id)),
        // The dot goes at once; the badge follows when the summary refetches.
        async onQueryStarted(id, { dispatch, queryFulfilled }) {
          const patch = dispatch(
            inboxApi.util.updateQueryData(
              'getNotifications',
              undefined,
              draft => {
                draft.forEach(item => {
                  if (!id || item.id === id) {
                    item.read = true;
                  }
                });
              },
            ),
          );
          queryFulfilled.catch(patch.undo);
        },
        invalidatesTags: ['Notification'],
      },
    ),
    getMessages: build.query<ChatMessage[], void>({
      queryFn: (_arg, { extra }) =>
        runQuery(() => deps(extra).getMessages.execute()),
      providesTags: ['Message'],
    }),
    sendMessage: build.mutation<ChatMessage[], string>({
      queryFn: (text, { extra }) =>
        runQuery(() => deps(extra).sendMessage.execute(text)),
      // The member's bubble appears straight away; the concierge's reply arrives with the thread.
      async onQueryStarted(text, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          inboxApi.util.updateQueryData('getMessages', undefined, draft => {
            draft.push({
              id: PENDING_MESSAGE_ID,
              author: MessageAuthor.Member,
              text: text.trim(),
              sentAt: new Date().toISOString(),
              read: true,
            });
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            inboxApi.util.upsertQueryData('getMessages', undefined, data),
          );
        } catch {
          patch.undo();
        }
      },
    }),
    markMessagesRead: build.mutation<ChatMessage[], void>({
      queryFn: (_arg, { extra }) =>
        runQuery(() => deps(extra).markMessagesRead.execute()),
      invalidatesTags: ['Message'],
    }),
  }),
});

export const {
  useGetInboxSummaryQuery,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useMarkMessagesReadMutation,
} = inboxApi;
