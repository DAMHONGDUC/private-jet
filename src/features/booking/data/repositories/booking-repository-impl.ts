import type { Booking, NewBooking } from '../../domain/entities/booking';
import type { BookingRepository } from '../../domain/repositories/booking-repository';
import type { BookingDataSource } from '../datasources/booking-data-source';
import { toBooking, toCreateBookingDto } from '../mappers/booking-mapper';

export class BookingRepositoryImpl implements BookingRepository {
  constructor(private readonly dataSource: BookingDataSource) {}

  async createBooking(booking: NewBooking): Promise<Booking> {
    return toBooking(await this.dataSource.createBooking(toCreateBookingDto(booking)));
  }

  async getBookings(): Promise<Booking[]> {
    return (await this.dataSource.getBookings()).map(toBooking);
  }
}
