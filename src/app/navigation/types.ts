import type { NavigatorScreenParams } from '@react-navigation/native';

/** The top level: one of these at a time, by session status. */
export type AppStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: NavigatorScreenParams<RootTabParamList>;
  /** Over the tabs, signed in only. */
  Chat: undefined;
  Notifications: undefined;
  NewsDetail: { newsId: string };
  /** The charter flow, full screen over the tabs. */
  SearchResults: undefined;
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
  DashboardTab: undefined;
  TripsTab: NavigatorScreenParams<TripsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};
