import { useNavigation } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { AddCardScreen } from '@/features/profile/presentation/screens/AddCardScreen';
import { EditProfileScreen } from '@/features/profile/presentation/screens/EditProfileScreen';
import { HelpScreen } from '@/features/profile/presentation/screens/HelpScreen';
import { PaymentMethodsScreen } from '@/features/profile/presentation/screens/PaymentMethodsScreen';
import { ProfileScreen } from '@/features/profile/presentation/screens/ProfileScreen';
import type { AppStackParamList } from './types';

// The profile's pages open on the root stack, over the tabs, so the tab bar
// never shows on them; only the profile itself lives in the tab.

type Props<T extends keyof AppStackParamList> = NativeStackScreenProps<
  AppStackParamList,
  T
>;

/** The Profile tab. */
export function ProfileTab() {
  const root = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  return (
    <ProfileScreen
      onEditProfile={() => root.navigate('EditProfile')}
      onOpenPayments={() => root.navigate('PaymentMethods')}
      onOpenHelp={() => root.navigate('Help')}
      onOpenLegal={() => root.navigate('Legal')}
    />
  );
}

export function EditProfileRoute({ navigation }: Props<'EditProfile'>) {
  return <EditProfileScreen onSaved={() => navigation.goBack()} />;
}

export function PaymentMethodsRoute({ navigation }: Props<'PaymentMethods'>) {
  return (
    <PaymentMethodsScreen onAddCard={() => navigation.navigate('AddCard')} />
  );
}

export function AddCardRoute({ navigation }: Props<'AddCard'>) {
  return <AddCardScreen onAdded={() => navigation.goBack()} />;
}

export function HelpRoute({ navigation }: Props<'Help'>) {
  return <HelpScreen onContactConcierge={() => navigation.navigate('Chat')} />;
}
