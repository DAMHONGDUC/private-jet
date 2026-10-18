import { StyleSheet, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { makeStyles, useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';

type Props = {
  index: number;
  question: string;
  answer: string;
  open: boolean;
  last: boolean;
  onPress: () => void;
};

/** One FAQ row: tap to open its answer; the chevron turns to follow. */
export function FaqQuestion({
  index,
  question,
  answer,
  open,
  last,
  onPress,
}: Props) {
  const styles = useStyles();
  const palette = useBlackJetTheme();
  const chevron = useAnimatedStyle(() => ({
    transform: [
      { rotate: withTiming(open ? '90deg' : '0deg', { duration: 250 }) },
    ],
  }));

  return (
    <View style={[styles.item, !last && styles.divider]}>
      <PressableScale
        testID={`faq-${index}`}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        onPress={onPress}
        style={styles.question}
      >
        <AppText variant="subtitle" style={styles.flex}>
          {question}
        </AppText>
        <Animated.View style={chevron}>
          <Icon name="chevronRight" size={20} color={palette.secondaryText} />
        </Animated.View>
      </PressableScale>
      {open ? (
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(150)}
        >
          <AppText testID={`faq-answer-${index}`} muted style={styles.answer}>
            {answer}
          </AppText>
        </Animated.View>
      ) : null}
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  flex: { flex: 1 },
  item: { paddingVertical: AppSpacing.md },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.iron,
  },
  question: { flexDirection: 'row', alignItems: 'center', gap: AppSpacing.md },
  answer: { paddingTop: AppSpacing.sm, paddingRight: AppSpacing.xl },
}));
