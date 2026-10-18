import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { makeStyles } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { PressableScale } from '@/core/ui/PressableScale';
import { Screen } from '@/core/ui/Screen';
import { haptics } from '@/core/ui/haptics';

export const FAQ: { question: string; answer: string }[] = [
  {
    question: 'What is the difference between a charter and a shared flight?',
    answer:
      'A charter books the whole aircraft on the route and day you choose. A shared flight sells single seats on a scheduled BlackJet departure, so you pay per seat.',
  },
  {
    question: 'How late can I cancel?',
    answer:
      'Every booking cancels free of charge until 24 hours before the first departure. Open the trip in Trips and tap Cancel trip.',
  },
  {
    question: 'When should I arrive at the airport?',
    answer:
      'Fifteen minutes before departure is enough. You go through the private terminal, and your crew meets you at the car.',
  },
  {
    question: 'How much luggage can I bring?',
    answer:
      'Each jet lists its hold space in cubic metres. As a guide, a midsize jet takes one large and one cabin bag per passenger; your concierge can arrange more.',
  },
  {
    question: 'How do I pay with the BlackJet Wallet?',
    answer:
      'Choose the wallet at checkout. The fare comes off its balance straight away, and a cancellation puts it back.',
  },
  {
    question: 'Can I bring my pet?',
    answer:
      'Yes, on charters. Add it under special requests at checkout so the crew can prepare the cabin.',
  },
];

type Props = { onContactConcierge?: () => void };

/** Answers that open in place, and the concierge for the rest. */
export function HelpScreen({ onContactConcierge }: Props) {
  const styles = useStyles();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        <View>
          <AppText variant="title">Frequently asked</AppText>
        </View>
        <View>
          <Card style={styles.list}>
            {FAQ.map((item, index) => (
              <Question
                key={item.question}
                index={index}
                question={item.question}
                answer={item.answer}
                open={open === index}
                last={index === FAQ.length - 1}
                onPress={() => {
                  haptics.selection();
                  setOpen(current => (current === index ? null : index));
                }}
              />
            ))}
          </Card>
        </View>
        {onContactConcierge ? (
          <View style={styles.concierge}>
            <AppText muted>
              Something else? Your concierge answers around the clock.
            </AppText>
            <Button
              testID="help-concierge"
              title="Message the concierge"
              variant="secondary"
              onPress={onContactConcierge}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

type QuestionProps = {
  index: number;
  question: string;
  answer: string;
  open: boolean;
  last: boolean;
  onPress: () => void;
};

function Question({
  index,
  question,
  answer,
  open,
  last,
  onPress,
}: QuestionProps) {
  const styles = useStyles();
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
          <AppText style={styles.chevron}>›</AppText>
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
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  list: { paddingVertical: 0, overflow: 'hidden' },
  item: { paddingVertical: spacing.md },
  divider: { borderBottomWidth: 1, borderBottomColor: palette.iron },
  question: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  chevron: { fontSize: 26, lineHeight: 28, color: palette.secondaryText },
  answer: { paddingTop: spacing.sm, paddingRight: spacing.xl },
  concierge: { gap: spacing.md, alignItems: 'stretch' },
  legal: { gap: spacing.xs },
}));

/** Placeholder text for terms and privacy; the demo has no legal entity behind it. */
export function LegalScreen() {
  const styles = useStyles();
  const sections = [
    [
      'Demo build',
      'BlackJet is a demonstration app. Flights, bookings, payments and messages are simulated on the device; nothing is charged and no aircraft is reserved.',
    ],
    [
      'Your data',
      'The profile, trips and cards you add live in memory for this session only and are reset when the app restarts. Nothing is sent to a server.',
    ],
    [
      'Cancellations',
      'Bookings cancel free of charge until 24 hours before the first departure. After that the fare is kept.',
    ],
    [
      'Contact',
      'Questions about this demo go to the developer who shared it with you.',
    ],
  ];
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {sections.map(([title, body]) => (
          <View key={title} style={styles.legal}>
            <AppText variant="subtitle">{title}</AppText>
            <AppText muted>{body}</AppText>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}
