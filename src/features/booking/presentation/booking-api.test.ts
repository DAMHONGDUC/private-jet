import { dashboardApi } from '@/features/dashboard/presentation/dashboard-api';
import { flightsApi } from '@/features/flights/presentation/flights-api';
import { createTestStore } from '@/test-utils/test-store';
import { bookingApi } from './booking-api';

const request = {
  flightId: 'BJ-101',
  passengers: [{ fullName: 'Duc Dam' }, { fullName: 'An Tran' }],
  contactEmail: 'duc@example.com',
};

async function settle() {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
}

describe('booking through RTK Query', () => {
  it('refetches the flight, the trips and the dashboard after a booking', async () => {
    const store = createTestStore();
    const subscriptions = [
      store.dispatch(flightsApi.endpoints.getFlight.initiate('BJ-101')),
      store.dispatch(bookingApi.endpoints.getBookings.initiate()),
      store.dispatch(dashboardApi.endpoints.getDashboardSummary.initiate()),
    ];
    await Promise.all(subscriptions);

    const before = dashboardApi.endpoints.getDashboardSummary.select()(store.getState()).data!;
    expect(flightsApi.endpoints.getFlight.select('BJ-101')(store.getState()).data?.seatsAvailable).toBe(5);

    await store.dispatch(bookingApi.endpoints.bookFlight.initiate(request)).unwrap();
    await settle();

    const state = store.getState();
    expect(flightsApi.endpoints.getFlight.select('BJ-101')(state).data?.seatsAvailable).toBe(3);
    expect(bookingApi.endpoints.getBookings.select()(state).data).toHaveLength(2);
    const after = dashboardApi.endpoints.getDashboardSummary.select()(state).data!;
    expect(after.upcomingTrips).toBe(before.upcomingTrips + 1);
    expect(after.totalSpentThisYear).toBe(before.totalSpentThisYear + 5800);

    subscriptions.forEach(subscription => subscription.unsubscribe());
  });

  it('stores a serializable error and books nothing when seats run out', async () => {
    const store = createTestStore();

    const result = await store.dispatch(
      bookingApi.endpoints.bookFlight.initiate({ ...request, flightId: 'BJ-104' }),
    );

    expect(result.error).toEqual({ code: 'SOLD_OUT', message: 'This flight is sold out.' });
    const bookings = await store.dispatch(bookingApi.endpoints.getBookings.initiate());
    expect(bookings.data).toHaveLength(1);
  });
});
