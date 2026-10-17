import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { makeStyles } from '@/core/theme/blackjet';
import { spacing } from '@/core/theme/theme';
import { AppText } from '@/core/ui/AppText';
import { Button } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { errorMessage } from '@/core/ui/StateViews';
import { haptics } from '@/core/ui/haptics';
import { validateProfileUpdate } from '@/features/auth/domain/entities/user';
import { useUpdateProfileMutation } from '@/features/auth/presentation/auth-api';
import { selectUser } from '@/features/auth/presentation/session-slice';
import { FormField } from '@/features/booking/presentation/components/FormField';
import { Avatar } from '../components/Avatar';

type Props = { onSaved: () => void };

/** Name and phone; the email is the sign-in and stays as it is. */
export function EditProfileScreen({ onSaved }: Props) {
  const styles = useStyles();
  const user = useSelector(selectUser);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [problem, setProblem] = useState<string | null>(null);
  const [updateProfile, { isLoading, error, reset }] = useUpdateProfileMutation();

  const save = async () => {
    const update = { fullName: fullName.trim(), phone: phone.trim() };
    const invalid = validateProfileUpdate(update);
    setProblem(invalid);
    if (invalid) {
      haptics.error();
      return;
    }
    reset();
    try {
      await updateProfile(update).unwrap();
      haptics.success();
      onSaved();
    } catch {
      haptics.error();
    }
  };

  const shownError = problem ?? (error ? errorMessage(error) : null);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(450)} style={styles.avatar}>
            <Avatar name={fullName || '?'} size={72} />
          </Animated.View>
          <Animated.View entering={FadeInDown.duration(450).delay(80)} style={styles.form}>
            <FormField
              testID="profile-full-name"
              label="Full name"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
            />
            <FormField
              testID="profile-phone"
              label="Phone"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
            <View style={styles.readOnly}>
              <AppText variant="caption" muted>
                Email
              </AppText>
              <AppText>{user?.email}</AppText>
            </View>
          </Animated.View>
          {shownError ? (
            <Animated.View entering={FadeIn}>
              <AppText testID="profile-error" style={styles.error}>
                {shownError}
              </AppText>
            </Animated.View>
          ) : null}
          <Button testID="save-profile" title="Save" loading={isLoading} onPress={save} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = makeStyles(palette => ({
  flex: { flex: 1 },
  content: { padding: spacing.lg, gap: spacing.xl },
  avatar: { alignItems: 'center' },
  form: { gap: spacing.md },
  readOnly: { gap: spacing.xs, paddingVertical: spacing.sm },
  error: { color: palette.error, textAlign: 'center' },
}));
