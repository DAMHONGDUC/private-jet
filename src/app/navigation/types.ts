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
  /** A tab's detail pages, over the tabs so the tab bar stays on the tabs only. */
  TripDetail: { bookingId: string };
  EditProfile: undefined;
  PaymentMethods: undefined;
  AddCard: undefined;
  Help: undefined;
  Legal: undefined;
};

/** The three tabs; each is one screen, and what they open goes on the root stack. */
export type RootTabParamList = {
  DashboardTab: undefined;
  TripsTab: undefined;
  ProfileTab: undefined;
};
