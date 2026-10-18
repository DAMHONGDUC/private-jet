import type { BookingDto, PlaceBookingDto } from '../models/booking-dto';
import type { PaymentMethodDto } from '../models/payment-dto';

export interface BookingDataSource {
  getBookings(): Promise<BookingDto[]>;
  getBooking(id: string): Promise<BookingDto | undefined>;
  /**
   * Charges, takes seats and records the booking in one call, e.g.
   * `POST /bookings` with an `Idempotency-Key` header. Throws a `DomainError`
   * when the backend refuses it, as the HTTP client does.
   */
  placeBooking(
    order: PlaceBookingDto,
    idempotencyKey: string,
  ): Promise<BookingDto>;
  /** Returns the updated booking, or undefined when it does not exist. */
  updateStatus(
    id: string,
    status: BookingDto['status'],
  ): Promise<BookingDto | undefined>;
}

export interface PaymentDataSource {
  getPaymentMethods(): Promise<PaymentMethodDto[]>;
  addCard(
    card: Omit<PaymentMethodDto, 'id' | 'is_default'>,
  ): Promise<PaymentMethodDto>;
  setDefault(id: string): Promise<PaymentMethodDto[]>;
  removeCard(id: string): Promise<PaymentMethodDto[]>;
}
