import type { Booking, NewBooking } from '../entities/booking';

export interface BookingRepository {
  createBooking(booking: NewBooking): Promise<Booking>;
  getBookings(): Promise<Booking[]>;
}
