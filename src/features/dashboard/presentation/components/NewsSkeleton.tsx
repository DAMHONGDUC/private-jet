import { StyleSheet, View } from 'react-native';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { Shimmer } from '@/core/ui/Shimmer';

/** The news carousel while stories load (feature-docs/dashboard §6.4). */
export function NewsSkeleton() {
  const palette = useBlackJetTheme();
  return (
    <View
      testID="news-skeleton"
      style={[styles.news, { backgroundColor: palette.primaryBackground }]}
    >
      <Shimmer width={142} height={8} />
      <Shimmer width={93} height={8} />
    </View>
  );
}

const styles = StyleSheet.create({
  news: {
    height: 220,
    borderRadius: 24,
    padding: 16,
    justifyContent: 'flex-end',
    gap: 16,
  },
});
