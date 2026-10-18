import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSelector } from 'react-redux';
import { useT } from '@/core/i18n/i18n';
import { makeStyles } from '@/core/theme/blackjet';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { BottomActions } from '@/core/ui/BottomActions';
import { Button } from '@/core/ui/Button';
import { Screen } from '@/core/ui/Screen';
import { errorMessage } from '@/core/error/error-message';
import { haptics } from '@/core/ui/haptics';
import { hasErrors } from '@/core/validation/field-errors';
import { profileErrors } from '@/features/auth/domain/entities/user';
import { useUpdateProfileMutation } from '@/features/auth/presentation/auth-api';
import { selectUser } from '@/features/auth/presentation/session-slice';
import { FormField } from '@/features/booking/presentation/components/FormField';
import { Avatar } from '../components/Avatar';

type Props = { onSaved: () => void };

/** Name and phone; the email is the sign-in and stays as it is. */
export function EditProfileScreen({ onSaved }: Props) {
  const styles = useStyles();
  const t = useT();
  const user = useSelector(selectUser);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  /** Errors show once Save was tapped, then follow the typing until fixed. */
  const [submitted, setSubmitted] = useState(false);
  const [updateProfile, { isLoading, error, reset }] =
    useUpdateProfileMutation();
  const update = { fullName: fullName.trim(), phone: phone.trim() };
  const errors = submitted ? profileErrors(update) : {};

  const save = async () => {
    setSubmitted(true);
    if (hasErrors(profileErrors(update))) {
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

  const shownError = error ? errorMessage(error) : null;

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatar}>
            <Avatar name={fullName || '?'} size={72} />
          </View>
          <View style={styles.form}>
            <FormField
              testID="profile-full-name"
              label="Full name"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
            />
            <FormField
              testID="profile-phone"
              label="Phone"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
            />
            <View style={styles.readOnly}>
              <AppText variant="caption" muted>
                Email
              </AppText>
              <AppText>{user?.email}</AppText>
            </View>
          </View>
          {shownError ? (
            <Animated.View entering={FadeIn}>
              <AppText testID="profile-error" style={styles.error}>
                {shownError}
              </AppText>
            </Animated.View>
          ) : null}
        </ScrollView>
        <BottomActions>
          <Button
            testID="save-profile"
            title={t('actions.save')}
            loading={isLoading}
            onPress={save}
          />
        </BottomActions>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const useStyles = makeStyles(palette => ({
  flex: { flex: 1 },
  content: { padding: AppSpacing.spacing16, gap: AppSpacing.spacing24 },
  avatar: { alignItems: 'center' },
  form: { gap: AppSpacing.spacing12 },
  readOnly: { gap: AppSpacing.spacing4, paddingVertical: AppSpacing.spacing8 },
  error: { color: palette.error, textAlign: 'center' },
}));
