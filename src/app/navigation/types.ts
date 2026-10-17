import type { NavigatorScreenParams } from '@react-navigation/native';
import type { AirportField } from '@/features/flights/presentation/screens/AirportPickerScreen';

export type FlightsStackParamList = {
  FlightSearch: undefined;
  AirportPicker: { field: AirportField };
  FlightResults: undefined;
  FlightDetail: { flightId: string };
  Booking: { flightId: string };
  BookingConfirmation: { bookingId: string };
};

/** The top level: one of these at a time, by session status. */
export type AppStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: NavigatorScreenParams<RootTabParamList>;
};

export type HomeStackParamList = {
  Home: undefined;
  JetQuote: { legIndex: number; quoteId: string };
  CharterCheckout: undefined;
  CharterConfirmation: { bookingId: string };
};

export type TripsStackParamList = {
  TripList: undefined;
  TripDetail: { bookingId: string };
};

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
  PaymentMethods: undefined;
  AddCard: undefined;
  Help: undefined;
  Legal: undefined;
};

export type RootTabParamList = {
  DashboardTab: NavigatorScreenParams<HomeStackParamList>;
  FlightsTab: NavigatorScreenParams<FlightsStackParamList>;
  TripsTab: NavigatorScreenParams<TripsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};
