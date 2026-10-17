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

export type RootTabParamList = {
  DashboardTab: undefined;
  FlightsTab: NavigatorScreenParams<FlightsStackParamList>;
  TripsTab: undefined;
};
