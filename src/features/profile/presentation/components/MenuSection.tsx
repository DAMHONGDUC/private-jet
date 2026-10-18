import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppSpacing } from '@/core/theme/app-spacing';
import { AppText } from '@/core/ui/AppText';
import { Card } from '@/core/ui/Card';

/** A labelled group of menu rows on the profile, in one card. */
export function MenuSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <AppText variant="label" muted>
        {title}
      </AppText>
      <Card style={styles.list}>{children}</Card>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: AppSpacing.spacing8 },
  list: { paddingVertical: 0 },
});
