import { StyleSheet, View } from 'react-native';
import { useT } from '@/core/i18n/i18n';
import { useBlackJetTheme } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { elevation } from '@/core/theme/theme';
import { Icon } from '@/core/ui/Icon';
import { PressableScale } from '@/core/ui/PressableScale';
import type { Airport } from '@/features/flights/domain/entities/flight';
import { AirportBox, Align } from './AirportBox';

type Props = {
  airports: Record<string, Airport | undefined>;
  origin: string | null;
  destination: string | null;
  /** Round Trip shows ⇄; everything else a plane. */
  roundTrip: boolean;
  onPickOrigin: () => void;
  onPickDestination: () => void;
  onSwap: () => void;
  originInvalid?: boolean;
  destinationInvalid?: boolean;
  testID: string;
};

/** From and To side by side with the round swap button between them. */
export function RouteRow(props: Props) {
  const palette = useBlackJetTheme();
  const t = useT();
  const { airports, origin, destination, testID } = props;
  return (
    <View style={styles.route}>
      <AirportBox
        testID={`${testID}-origin`}
        label={t('search.from')}
        code={origin}
        airport={origin ? airports[origin] : undefined}
        placeholder="—"
        align={Align.Start}
        invalid={props.originInvalid}
        onPress={props.onPickOrigin}
      />
      <AirportBox
        testID={`${testID}-destination`}
        label={t('search.to')}
        code={destination}
        airport={destination ? airports[destination] : undefined}
        placeholder="—"
        align={Align.End}
        invalid={props.destinationInvalid}
        onPress={props.onPickDestination}
      />
      <PressableScale
        testID={`${testID}-swap`}
        accessibilityRole="button"
        accessibilityLabel={t('search.swap')}
        onPress={props.onSwap}
        scaleTo={0.92}
        style={[
          styles.swap,
          { backgroundColor: palette.raised, borderColor: palette.iron },
          elevation(palette.shadow),
        ]}
      >
        <Icon
          name={props.roundTrip ? 'swap' : 'plane'}
          size={props.roundTrip ? 20 : 16}
          color={palette.accent}
        />
      </PressableScale>
    </View>
  );
}

const SWAP_SIZE = 40;

const styles = StyleSheet.create({
  route: {
    flexDirection: 'row',
    gap: AppSpacing.sm,
    justifyContent: 'space-between',
  },
  swap: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: SWAP_SIZE,
    height: SWAP_SIZE,
    marginLeft: -SWAP_SIZE / 2,
    marginTop: -SWAP_SIZE / 2,
    borderRadius: SWAP_SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
