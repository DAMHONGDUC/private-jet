import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolate,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import {
  brandOf,
  PaymentMethodKind,
} from '@/features/booking/domain/entities/payment';
import { CardBack } from './CardBack';
import { CARD_RATIO, PaymentCard } from './PaymentCard';

type Props = {
  holder: string;
  number: string;
  expiry: string;
  cvc: string;
  /** 0 shows the front, 1 the back; animated by the screen. */
  turned: SharedValue<number>;
};

/** The live preview of a card being added, with a back that turns into view. */
export function FlippingCardPreview({
  holder,
  number,
  expiry,
  cvc,
  turned,
}: Props) {
  const frontStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(turned.value, [0, 1], [0, 180])}deg` },
    ],
  }));
  const backStyle = useAnimatedStyle(() => ({
    transform: [
      { perspective: 1000 },
      { rotateY: `${interpolate(turned.value, [0, 1], [180, 360])}deg` },
    ],
  }));
  const preview = {
    kind: PaymentMethodKind.Card,
    brand: brandOf(number),
    holder: holder.toUpperCase(),
    expiry,
  };

  return (
    <View style={styles.stage}>
      <Animated.View style={[styles.face, frontStyle]}>
        <PaymentCard testID="card-preview" method={preview} number={number} />
      </Animated.View>
      <Animated.View style={[styles.face, styles.back, backStyle]}>
        <CardBack cvc={cvc} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { width: '100%', aspectRatio: CARD_RATIO },
  face: { ...StyleSheet.absoluteFill, backfaceVisibility: 'hidden' },
  back: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundImage: 'linear-gradient(135deg, #2A2A2A 0%, #151515 100%)',
    paddingVertical: 22,
    gap: 18,
  },
});
