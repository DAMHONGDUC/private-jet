import type { BookingDto, CreateBookingDto } from '../models/booking-dto';
import type { PaymentMethodDto } from '../models/payment-dto';

export interface BookingDataSource {
  getBookings(): Promise<BookingDto[]>;
  getBooking(id: string): Promise<BookingDto | undefined>;
  createBooking(booking: CreateBookingDto): Promise<BookingDto>;
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
  /** False when the method cannot cover the amount. */
  charge(id: string, amountCents: number, currency: string): Promise<boolean>;
}
