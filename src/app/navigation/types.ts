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

export type TripsStackParamList = {
  TripList: undefined;
  TripDetail: { bookingId: string };
};

export type RootTabParamList = {
  DashboardTab: undefined;
  FlightsTab: NavigatorScreenParams<FlightsStackParamList>;
  TripsTab: NavigatorScreenParams<TripsStackParamList>;
};
