import { useNavigation } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  type NativeStackNavigationProp,
  type NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { blackJetFonts, useBlackJetTheme } from '@/core/theme/blackjet';
import { AddCardScreen } from '@/features/profile/presentation/screens/AddCardScreen';
import { EditProfileScreen } from '@/features/profile/presentation/screens/EditProfileScreen';
import { HelpScreen, LegalScreen } from '@/features/profile/presentation/screens/HelpScreen';
import { PaymentMethodsScreen } from '@/features/profile/presentation/screens/PaymentMethodsScreen';
import { ProfileScreen } from '@/features/profile/presentation/screens/ProfileScreen';
import type { AppStackParamList, ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

type Props<T extends keyof ProfileStackParamList> = NativeStackScreenProps<ProfileStackParamList, T>;

function ProfileRoute({ navigation }: Props<'Profile'>) {
  return (
    <ProfileScreen
      onEditProfile={() => navigation.navigate('EditProfile')}
      onOpenPayments={() => navigation.navigate('PaymentMethods')}
      onOpenHelp={() => navigation.navigate('Help')}
      onOpenLegal={() => navigation.navigate('Legal')}
    />
  );
}

function EditProfileRoute({ navigation }: Props<'EditProfile'>) {
  return <EditProfileScreen onSaved={() => navigation.goBack()} />;
}

function PaymentMethodsRoute({ navigation }: Props<'PaymentMethods'>) {
  return <PaymentMethodsScreen onAddCard={() => navigation.navigate('AddCard')} />;
}

function AddCardRoute({ navigation }: Props<'AddCard'>) {
  return <AddCardScreen onAdded={() => navigation.goBack()} />;
}

function HelpRoute() {
  const root = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  return <HelpScreen onContactConcierge={() => root.navigate('Chat')} />;
}

export function ProfileNavigator() {
  const palette = useBlackJetTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: palette.secondaryBackground },
        headerTintColor: palette.primaryText,
        headerTitleStyle: { color: palette.primaryText, fontFamily: blackJetFonts.medium },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: palette.secondaryBackground },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Profile" component={ProfileRoute} options={{ headerShown: false }} />
      <Stack.Screen name="EditProfile" component={EditProfileRoute} options={{ title: 'Personal information' }} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsRoute} options={{ title: 'Payment methods' }} />
      <Stack.Screen
        name="AddCard"
        component={AddCardRoute}
        options={{ title: 'Add a card', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="Help" component={HelpRoute} options={{ title: 'Help' }} />
      <Stack.Screen name="Legal" component={LegalScreen} options={{ title: 'Terms & privacy' }} />
    </Stack.Navigator>
  );
}
