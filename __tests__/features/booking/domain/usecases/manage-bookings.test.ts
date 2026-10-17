import { BookingMockDataSource, PaymentMockDataSource } from '@/features/booking/data/datasources/booking-mock-data-source';
import { BookingRepositoryImpl, PaymentRepositoryImpl } from '@/features/booking/data/repositories/booking-repository-impl';
import { canCancel, isUpcoming } from '@/features/booking/domain/entities/booking';
import { GetBookings } from '@/features/booking/domain/usecases/get-bookings';
import { CancelBooking } from '@/features/booking/domain/usecases/manage-bookings';
import { AddCard, GetPaymentMethods, RemoveCard, SetDefaultPayment } from '@/features/booking/domain/usecases/payments';

const NOW = new Date('2026-10-16T08:00:00.000Z');

test('the seeded account has upcoming, flown and cancelled trips, soonest first', async () => {
  const repository = new BookingRepositoryImpl(new BookingMockDataSource(0, () => NOW));
  const bookings = await new GetBookings(repository).execute();

  expect(bookings.map(item => item.reference)).toEqual(['BJ2KQP', 'BJX5TN', 'BJ4F7Q', 'BJR8MX']);
  expect(bookings.filter(item => isUpcoming(item, NOW)).map(item => item.reference)).toEqual(['BJ4F7Q', 'BJR8MX']);
});

test('cancels an upcoming trip once, never a flown one', async () => {
  const repository = new BookingRepositoryImpl(new BookingMockDataSource(0, () => NOW));
  const cancel = new CancelBooking(repository, () => NOW);

  const cancelled = await cancel.execute('bk-seed-1');
  expect(cancelled.status).toBe('cancelled');
  expect(canCancel(cancelled, NOW)).toBe(false);

  await expect(cancel.execute('bk-seed-1')).rejects.toMatchObject({ message: 'This trip is already cancelled.' });
  await expect(cancel.execute('bk-seed-3')).rejects.toMatchObject({ code: 'VALIDATION' });
});

test('adds a valid card, switches the default and protects the wallet', async () => {
  const repository = new PaymentRepositoryImpl(new PaymentMockDataSource(0));
  const get = new GetPaymentMethods(repository);

  await expect(
    new AddCard(repository, () => NOW).execute({ holder: 'A Reed', number: '4242 4242 4242 4241', expiry: '08/29', cvc: '123' }),
  ).rejects.toMatchObject({ message: 'Enter a valid card number.' });
  await expect(
    new AddCard(repository, () => NOW).execute({ holder: 'A Reed', number: '5555 5555 5555 4444', expiry: '01/26', cvc: '123' }),
  ).rejects.toMatchObject({ message: 'This card has expired.' });

  const card = await new AddCard(repository, () => NOW).execute({ holder: 'A Reed', number: '5555 5555 5555 4444', expiry: '08/29', cvc: '123' });
  expect(card).toMatchObject({ brand: 'mastercard', last4: '4444', expiry: '08/29' });

  await new SetDefaultPayment(repository).execute(card.id);
  expect((await get.execute())[0].id).toBe(card.id);

  await expect(new RemoveCard(repository).execute('pm-wallet')).rejects.toMatchObject({ code: 'VALIDATION' });
  expect((await new RemoveCard(repository).execute('pm-amex')).map(item => item.id)).not.toContain('pm-amex');
});

test('the wallet pays until its balance runs out', async () => {
  const repository = new PaymentRepositoryImpl(new PaymentMockDataSource(0));

  await repository.charge('pm-wallet', 20_000, 'EUR');
  await expect(repository.charge('pm-wallet', 20_000, 'EUR')).rejects.toMatchObject({ code: 'VALIDATION' });
  expect((await repository.getPaymentMethods()).find(item => item.id === 'pm-wallet')?.balance).toBe(5000);
});
