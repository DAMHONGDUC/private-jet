import type { BookingDto, CreateBookingDto } from '../models/booking-dto';

export interface BookingDataSource {
  getBookings(): Promise<BookingDto[]>;
  createBooking(booking: CreateBookingDto): Promise<BookingDto>;
}
