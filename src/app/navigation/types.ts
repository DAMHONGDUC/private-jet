import type { NavigatorScreenParams } from '@react-navigation/native';

export type FlightsStackParamList = {
  FlightList: undefined;
  FlightDetail: { flightId: string };
  Booking: { flightId: string };
  BookingConfirmation: { bookingId: string };
};

export type RootTabParamList = {
  DashboardTab: undefined;
  FlightsTab: NavigatorScreenParams<FlightsStackParamList>;
  TripsTab: undefined;
};
