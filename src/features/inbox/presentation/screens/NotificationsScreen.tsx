import { useMemo, useState } from 'react';
import { RefreshControl, SectionList, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import { Screen } from '@/core/ui/Screen';
import { EmptyView, ErrorView, LoadingView } from '@/core/ui/StateViews';
import { haptics } from '@/core/ui/haptics';
import { isToday, type AppNotification } from '../../domain/entities/inbox';
import { useGetNotificationsQuery, useMarkNotificationReadMutation } from '../inbox-api';
import { KIND_ICONS, timeAgo } from '../inbox-labels';

type Props = {
  /** A notification about a trip was tapped. */
  onOpenTrip: (bookingId: string) => void;
  /** Groups Today from Earlier; tests pin it. */
  now?: Date;
};

/** Newest first, today apart from the rest; tapping one reads it and opens its trip. */
export function NotificationsScreen({ onOpenTrip, now: nowProp }: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const [now] = useState(() => nowProp ?? new Date());
  const { data, error, isLoading, isFetching, refetch } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();

  const sections = useMemo(() => {
    const all = data ?? [];
    return [
      { title: 'Today', data: all.filter(item => isToday(item.createdAt, now)) },
      { title: 'Earlier', data: all.filter(item => !isToday(item.createdAt, now)) },
    ].filter(section => section.data.length > 0);
  }, [data, now]);
  // Position in the list, so the rows cascade in order.
  const order = useMemo(
    () => new Map(sections.flatMap(section => section.data).map((item, position) => [item.id, position])),
    [sections],
  );
  const unread = (data ?? []).filter(item => !item.read).length;

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

  const open = (item: AppNotification) => {
    haptics.selection();
    if (!item.read) {
      markRead(item.id);
    }
    if (item.bookingId) {
      onOpenTrip(item.bookingId);
    }
  };

  return (
    <Screen>
      <SectionList
        testID="notification-list"
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        refreshControl={
          <RefreshControl
            refreshing={isFetching && !isLoading}
            onRefresh={() => {
              refetch();
            }}
            tintColor={palette.jetBlack}
          />
        }
        ListHeaderComponent={
          unread > 0 ? (
            <Animated.View exiting={FadeOut} style={styles.top}>
              <AppText muted>
                {unread} unread
              </AppText>
              <PressableScale
                testID="mark-all-read"
                accessibilityRole="button"
                onPress={() => {
                  haptics.light();
                  markRead(undefined);
                }}
              >
                <AppText variant="subtitle" accent>
                  Mark all read
                </AppText>
              </PressableScale>
            </Animated.View>
          ) : undefined
        }
        ListEmptyComponent={<EmptyView title="All quiet" message="Crew updates, offers and replies show up here." />}
        renderSectionHeader={({ section }) => (
          <AppText variant="label" muted style={styles.section}>
            {section.title}
          </AppText>
        )}
        renderItem={({ item }) => {
          const delay = Math.min(order.get(item.id) ?? 0, 8) * 60;
          return (
            <Animated.View entering={FadeInDown.duration(400).delay(delay)} layout={LinearTransition}>
              <PressableScale
                testID={`notification-${item.id}`}
                accessibilityRole="button"
                accessibilityState={{ selected: !item.read }}
                onPress={() => open(item)}
                style={[styles.row, !item.read && styles.unreadRow]}
              >
                <View style={styles.icon}>
                  <Icon name={KIND_ICONS[item.kind]} size={20} color={palette.primaryText} />
                </View>
                <View style={styles.text}>
                  <View style={styles.titleRow}>
                    <AppText variant="subtitle" style={styles.title} numberOfLines={1}>
                      {item.title}
                    </AppText>
                    <AppText variant="caption" muted>
                      {timeAgo(item.createdAt, now)}
                    </AppText>
                  </View>
                  <AppText muted numberOfLines={3}>
                    {item.body}
                  </AppText>
                </View>
                {item.read ? null : (
                  <Animated.View
                    testID={`unread-${item.id}`}
                    entering={FadeIn}
                    exiting={FadeOut.duration(250)}
                    style={styles.dot}
                  />
                )}
              </PressableScale>
            </Animated.View>
          );
        }}
      />
    </Screen>
  );
}

const useStyles = makeStyles(palette => ({
  list: { padding: spacing.lg, gap: spacing.sm, flexGrow: 1 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  section: { marginTop: spacing.md, marginBottom: spacing.xs },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: palette.iron,
    backgroundColor: palette.secondaryBackground,
  },
  unreadRow: { backgroundColor: palette.primaryBackground },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: palette.iron,
  },
  text: { flex: 1, gap: 4 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  title: { flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: palette.error, marginTop: 6 },
}));
