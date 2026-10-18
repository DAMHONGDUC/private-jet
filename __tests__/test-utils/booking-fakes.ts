import {
  BookingStatus,
  type Booking,
  type NewBooking,
} from '@/features/booking/domain/entities/booking';
import {
  CardBrand,
  PaymentMethodKind,
  type PaymentMethod,
} from '@/features/booking/domain/entities/payment';
import type {
  BookingRepository,
  PaymentRepository,
} from '@/features/booking/domain/repositories/booking-repository';

/** Repositories for booking use-case tests: bookings echo what they are given, one Visa card pays. */
const visa: PaymentMethod = {
  id: 'pm-visa',
  kind: PaymentMethodKind.Card,
  brand: CardBrand.Visa,
  last4: '4242',
  holder: 'A',
  isDefault: true,
};

export function createBookingRepository(
  now: Date,
): jest.Mocked<BookingRepository> {
  return {
    getBookings: jest.fn(),
    getBooking: jest.fn(),
    cancelBooking: jest.fn(),
    createBooking: jest.fn(
      async (booking: NewBooking): Promise<Booking> => ({
        ...booking,
        id: 'b1',
        reference: 'BJAAAA',
        status: BookingStatus.Confirmed,
        bookedAt: now.toISOString(),
      }),
    ),
  };
}

export function createPaymentRepository(): jest.Mocked<PaymentRepository> {
  return {
    getPaymentMethods: jest.fn().mockResolvedValue([visa]),
    addCard: jest.fn(),
    setDefault: jest.fn(),
    removeCard: jest.fn(),
    charge: jest.fn().mockResolvedValue(undefined),
  };
}
