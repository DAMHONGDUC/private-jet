import { flightsApi } from '@/features/flights/presentation/flights-api';
import { createTestStore } from '@test-utils/test-store';
import { bookingApi } from '@/features/booking/presentation/booking-api';

const request = {
  flightId: 'BJ-101',
  passengers: [{ fullName: 'Alexander Reed' }, { fullName: 'Sophia Reed' }],
  contactEmail: 'demo@blackjet.app',
};

async function settle() {
  await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
}

describe('booking through RTK Query', () => {
  it('refetches the flight and the trips after a booking', async () => {
    const store = createTestStore();
    const subscriptions = [
      store.dispatch(flightsApi.endpoints.getFlight.initiate('BJ-101')),
      store.dispatch(bookingApi.endpoints.getBookings.initiate()),
    ];
    await Promise.all(subscriptions);

    expect(flightsApi.endpoints.getFlight.select('BJ-101')(store.getState()).data?.seatsAvailable).toBe(5);

    await store.dispatch(bookingApi.endpoints.bookFlight.initiate(request)).unwrap();
    await settle();

    const state = store.getState();
    expect(flightsApi.endpoints.getFlight.select('BJ-101')(state).data?.seatsAvailable).toBe(3);
    // Four seeded bookings, plus this one.
    expect(bookingApi.endpoints.getBookings.select()(state).data).toHaveLength(5);

    subscriptions.forEach(subscription => subscription.unsubscribe());
  });

  it('stores a serializable error and books nothing when seats run out', async () => {
    const store = createTestStore();

    const result = await store.dispatch(
      bookingApi.endpoints.bookFlight.initiate({ ...request, flightId: 'BJ-104' }),
    );

    expect(result.error).toEqual({ code: 'SOLD_OUT', message: 'This flight is sold out.' });
    const bookings = await store.dispatch(bookingApi.endpoints.getBookings.initiate());
    expect(bookings.data).toHaveLength(4);
  });
});
