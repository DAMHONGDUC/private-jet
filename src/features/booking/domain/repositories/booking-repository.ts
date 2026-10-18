import type { Booking, BookingOrder } from '../entities/booking';
import type { NewCard, PaymentMethod } from '../entities/payment';

export interface BookingRepository {
  /**
   * Charges the payment method, takes the seats on any scheduled flight and
   * records the booking: one backend call that does all of it or none of it.
   * The same idempotency key returns the booking already placed. Throws
   * `VALIDATION` when the payment is declined, `SOLD_OUT` when the seats are gone.
   */
  placeBooking(order: BookingOrder): Promise<Booking>;
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
}
