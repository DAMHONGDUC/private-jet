import {
  BookingMockDataSource,
  PaymentMockDataSource,
} from '@/features/booking/data/datasources/booking-mock-data-source';
import {
  BookingRepositoryImpl,
  PaymentRepositoryImpl,
} from '@/features/booking/data/repositories/booking-repository-impl';
import {
  BookingKind,
  canCancel,
  isUpcoming,
  travellerErrors,
  type BookingOrder,
  type NewBooking,
} from '@/features/booking/domain/entities/booking';
import {
  CardBrand,
  newCardErrors,
} from '@/features/booking/domain/entities/payment';
import { GetBookings } from '@/features/booking/domain/usecases/get-bookings';
import { CancelBooking } from '@/features/booking/domain/usecases/manage-bookings';
import {
  AddCard,
  GetPaymentMethods,
  RemoveCard,
  SetDefaultPayment,
} from '@/features/booking/domain/usecases/payments';
import { FlightMockDataSource } from '@/features/flights/data/datasources/flight-mock-data-source';
import { FlightRepositoryImpl } from '@/features/flights/data/repositories/flight-repository-impl';

const NOW = new Date('2026-10-16T08:00:00.000Z');

test('the seeded account has upcoming, flown and cancelled trips, soonest first', async () => {
  const repository = new BookingRepositoryImpl(
    new BookingMockDataSource(0, () => NOW),
  );
  const bookings = await new GetBookings(repository).execute();

  expect(bookings.map(item => item.reference)).toEqual([
    'BJ2KQP',
    'BJX5TN',
    'BJ4F7Q',
    'BJR8MX',
  ]);
  expect(
    bookings.filter(item => isUpcoming(item, NOW)).map(item => item.reference),
  ).toEqual(['BJ4F7Q', 'BJR8MX']);
});

test('cancels an upcoming trip once, never a flown one', async () => {
  const repository = new BookingRepositoryImpl(
    new BookingMockDataSource(0, () => NOW),
  );
  const cancel = new CancelBooking(repository, () => NOW);

  const cancelled = await cancel.execute('bk-seed-1');
  expect(cancelled.status).toBe('cancelled');
  expect(canCancel(cancelled, NOW)).toBe(false);

  await expect(cancel.execute('bk-seed-1')).rejects.toMatchObject({
    message: 'This trip is already cancelled.',
  });
  await expect(cancel.execute('bk-seed-3')).rejects.toMatchObject({
    code: 'VALIDATION',
  });
});

test('adds a valid card, switches the default and protects the wallet', async () => {
  const repository = new PaymentRepositoryImpl(new PaymentMockDataSource(0));
  const get = new GetPaymentMethods(repository);

  await expect(
    new AddCard(repository, () => NOW).execute({
      holder: 'A Reed',
      number: '4242 4242 4242 4241',
      expiry: '08/29',
      cvc: '123',
    }),
  ).rejects.toMatchObject({ message: 'Enter a valid card number.' });
  await expect(
    new AddCard(repository, () => NOW).execute({
      holder: 'A Reed',
      number: '5555 5555 5555 4444',
      expiry: '01/26',
      cvc: '123',
    }),
  ).rejects.toMatchObject({ message: 'This card has expired.' });

  const card = await new AddCard(repository, () => NOW).execute({
    holder: 'A Reed',
    number: '5555 5555 5555 4444',
    expiry: '08/29',
    cvc: '123',
  });
  expect(card).toMatchObject({
    brand: CardBrand.Mastercard,
    last4: '4444',
    expiry: '08/29',
  });

  await new SetDefaultPayment(repository).execute(card.id);
  expect((await get.execute())[0].id).toBe(card.id);

  await expect(
    new RemoveCard(repository).execute('pm-wallet'),
  ).rejects.toMatchObject({ code: 'VALIDATION' });
  expect(
    (await new RemoveCard(repository).execute('pm-amex')).map(item => item.id),
  ).not.toContain('pm-amex');
});

function placing() {
  const payments = new PaymentMockDataSource(0);
  const flights = new FlightMockDataSource(0, NOW);
  return {
    bookings: new BookingRepositoryImpl(
      new BookingMockDataSource(0, () => NOW, () => 0, { payments, flights }),
    ),
    payments: new PaymentRepositoryImpl(payments),
    flights: new FlightRepositoryImpl(flights),
  };
}

const order = (
  booking: Partial<NewBooking> = {},
  rest: Partial<BookingOrder> = {},
): BookingOrder => ({
  booking: {
    kind: BookingKind.Charter,
    legs: [
      {
        originCode: 'SYD',
        originCity: 'Sydney',
        destinationCode: 'MEL',
        destinationCity: 'Melbourne',
        aircraftModel: 'Jet',
        departureAt: '2026-10-20T09:00:00.000Z',
        durationMinutes: 90,
      },
    ],
    passengers: [{ fullName: 'Alexander Reed' }],
    contactEmail: 'demo@blackjet.app',
    totalPrice: 30_000,
    currency: 'AUD',
    paymentLabel: 'Sovereign Wallet',
    notes: '',
    ...booking,
  },
  paymentMethodId: 'pm-wallet',
  idempotencyKey: 'key-1',
  ...rest,
});

const walletBalance = async (payments: PaymentRepositoryImpl) =>
  (await payments.getPaymentMethods()).find(item => item.id === 'pm-wallet')
    ?.balance;

test('the wallet pays until its balance runs out', async () => {
  const { bookings, payments } = placing();

  await bookings.placeBooking(order());
  await expect(
    bookings.placeBooking(order({}, { idempotencyKey: 'key-2' })),
  ).rejects.toMatchObject({ code: 'VALIDATION' });
  expect(await walletBalance(payments)).toBe(10_000);
});

test('placing the same order again returns the first booking and charges once', async () => {
  const { bookings, payments } = placing();

  const first = await bookings.placeBooking(order());
  const retry = await bookings.placeBooking(order());

  expect(retry.id).toBe(first.id);
  expect(await walletBalance(payments)).toBe(10_000);
  expect(await bookings.getBookings()).toHaveLength(5);
});

test('seats on a scheduled flight are taken with the booking, and refused when gone', async () => {
  const { bookings, flights } = placing();
  const seatLeg = (flightId: string) => ({
    legs: [{ ...order().booking.legs[0], flightId }],
    passengers: [{ fullName: 'Alexander Reed' }, { fullName: 'Sophia Reed' }],
  });

  await bookings.placeBooking(
    order(seatLeg('BJ-101'), { paymentMethodId: 'pm-visa' }),
  );
  expect((await flights.getFlightById('BJ-101')).seatsAvailable).toBe(3);

  await expect(
    bookings.placeBooking(
      order(seatLeg('BJ-104'), {
        paymentMethodId: 'pm-visa',
        idempotencyKey: 'key-2',
      }),
    ),
  ).rejects.toMatchObject({
    code: 'SOLD_OUT',
    message: 'This flight is sold out.',
  });
});

test('a new card reports each wrong field separately', () => {
  expect(
    newCardErrors(
      { holder: 'A', number: '1234', expiry: '13/29', cvc: '1' },
      NOW,
    ),
  ).toEqual({
    holder: 'Enter the name on the card.',
    number: 'Enter a valid card number.',
    expiry: 'Enter the expiry as MM/YY.',
    cvc: 'Enter the 3 or 4 digit security code.',
  });
  expect(
    newCardErrors(
      {
        holder: 'A Reed',
        number: '4242 4242 4242 4242',
        expiry: '08/29',
        cvc: '123',
      },
      NOW,
    ),
  ).toEqual({});
});

test('travellers report the guest and the email that need fixing', () => {
  const errors = travellerErrors(
    [{ fullName: 'Alexander Reed' }, { fullName: '' }],
    'not-an-email',
    4,
  );
  expect(errors.names).toEqual([
    undefined,
    'Enter the full name as on the passport.',
  ]);
  expect(errors.contactEmail).toBe('Enter a valid contact email.');
  expect(errors.party).toBeUndefined();
});
