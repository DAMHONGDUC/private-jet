import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BJText } from '@/core/ui/BJText';
import { PressableScale } from '@/core/ui/PressableScale';
import { MUTED } from '../login-colors';
import { LoginField } from './LoginField';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing: () => void;
  error?: string;
};

/** The sign-in password field with its Show / Hide toggle. */
export function PasswordField({
  value,
  onChangeText,
  onSubmitEditing,
  error,
}: Props) {
  const [hidden, setHidden] = useState(true);
  return (
    <View>
      <LoginField
        testID="login-password"
        label="Password"
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={hidden}
        textContentType="password"
        placeholder="••••••••"
        onSubmitEditing={onSubmitEditing}
        error={error}
      />
      <PressableScale
        testID="login-toggle-password"
        accessibilityRole="button"
        onPress={() => setHidden(current => !current)}
        style={styles.toggle}
      >
        <BJText size={13} style={styles.muted}>
          {hidden ? 'Show' : 'Hide'}
        </BJText>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: { position: 'absolute', right: 12, bottom: 15 },
  muted: { color: MUTED },
});
