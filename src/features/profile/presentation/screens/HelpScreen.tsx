import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { BottomActions } from '@/core/ui/BottomActions';
import { Button, ButtonVariant } from '@/core/ui/Button';
import { Card } from '@/core/ui/Card';
import { Screen } from '@/core/ui/Screen';
import { haptics } from '@/core/ui/haptics';
import { FaqQuestion } from '../components/FaqQuestion';

export const FAQ: { question: string; answer: string }[] = [
  {
    question: 'What is the difference between a charter and a shared flight?',
    answer:
      'A charter books the whole aircraft on the route and day you choose. A shared flight sells single seats on a scheduled Sovereign departure, so you pay per seat.',
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
    question: 'How do I pay with the Sovereign Wallet?',
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
  const t = useT();
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
              <FaqQuestion
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
      </ScrollView>
      {onContactConcierge ? (
        <BottomActions>
          <AppText muted style={styles.concierge}>
            {t('actions.helpMore')}
          </AppText>
          <Button
            testID="help-concierge"
            title={t('actions.messageTheConcierge')}
            variant={ButtonVariant.Secondary}
            onPress={onContactConcierge}
          />
        </BottomActions>
      ) : null}
    </Screen>
  );
}

const useStyles = makeStyles(() => ({
  flex: { flex: 1 },
  content: {
    padding: AppSpacing.lg,
    gap: AppSpacing.lg,
    paddingBottom: AppSpacing.xxl,
  },
  list: { paddingVertical: 0, overflow: 'hidden' },
  concierge: { textAlign: 'center' },
}));
