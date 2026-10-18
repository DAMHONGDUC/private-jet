import { StyleSheet, View } from 'react-native';
import { AppColors } from '@/core/theme/app-colors';
import { BJText } from '@/core/ui/BJText';

type Props = { cvc: string };

/** The back of the card being added: stripe, signature panel and the security code typed so far. */
export function CardBack({ cvc }: Props) {
  return (
    <>
      <View style={styles.stripe} />
      <View style={styles.signature}>
        <View style={styles.signatureLines} />
        <View style={styles.cvcBox}>
          <BJText size={16} weight="medium" style={styles.cvcText}>
            {cvc.padEnd(3, '•')}
          </BJText>
        </View>
      </View>
      <BJText size={13} style={styles.backNote}>
        Issued for the Sovereign demo. Charges are simulated and no money moves.
      </BJText>
    </>
  );
}

const styles = StyleSheet.create({
  stripe: { height: 42, backgroundColor: AppColors.fixed.cardStripe },
  signature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 10,
  },
  signatureLines: {
    flex: 1,
    height: 36,
    borderRadius: 4,
    backgroundColor: AppColors.fixed.cardBack,
  },
  cvcBox: {
    width: 64,
    height: 36,
    borderRadius: 4,
    backgroundColor: AppColors.fixed.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cvcText: { color: AppColors.fixed.cardInk, letterSpacing: 2 },
  backNote: { color: 'rgba(255, 255, 255, 0.5)', paddingHorizontal: 20 },
});
