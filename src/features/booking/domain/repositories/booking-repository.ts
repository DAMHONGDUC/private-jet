import type { Booking, NewBooking } from '../entities/booking';
import type { NewCard, PaymentMethod } from '../entities/payment';

export interface BookingRepository {
  createBooking(booking: NewBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
  /** Throws `NOT_FOUND` when there is no such booking. */
  getBooking(id: string): Promise<Booking>;
  cancelBooking(id: string): Promise<Booking>;
}

export interface PaymentRepository {
  getPaymentMethods(): Promise<PaymentMethod[]>;
  addCard(card: NewCard): Promise<PaymentMethod>;
  setDefault(id: string): Promise<PaymentMethod[]>;
  removeCard(id: string): Promise<PaymentMethod[]>;
  /** Takes the amount; throws `VALIDATION` when the wallet does not hold enough. */
  charge(id: string, amount: number, currency: string): Promise<void>;
}
