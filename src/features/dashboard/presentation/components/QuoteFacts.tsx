import { View } from 'react-native';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { radius } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { formatDuration } from '@/core/utils/format';
import type { JetQuote } from '../../domain/entities/charter';

type Props = { quote: JetQuote };

/** The jet's numbers in a three-column grid: time, routing, seats and specs. */
export function QuoteFacts({ quote }: Props) {
  const styles = useStyles();
  const facts: [string, string][] = [
    ['Flight time', formatDuration(quote.durationMinutes)],
    ['Routing', quote.nonStop ? 'Non stop' : '1 fuel stop'],
    ['Seats', `Up to ${quote.aircraft.totalSeats}`],
    ['Cruise', `${quote.specs.cruiseKmh} km/h`],
    ['Range', `${quote.specs.rangeKm.toLocaleString('en-AU')} km`],
    ['Baggage', `${quote.specs.baggageM3} m³`],
  ];

  return (
    <View style={styles.grid}>
      {facts.map(([label, value]) => (
        <View key={label} style={styles.fact}>
          <AppText variant="caption" muted>
            {label}
          </AppText>
          <AppText variant="subtitle">{value}</AppText>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles(palette => ({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: AppSpacing.spacing16,
    padding: AppSpacing.spacing16,
    borderRadius: radius.lg,
    backgroundColor: palette.primaryBackground,
  },
  fact: {
    width: '33.33%',
    gap: AppSpacing.spacing4,
    paddingRight: AppSpacing.spacing8,
  },
}));
