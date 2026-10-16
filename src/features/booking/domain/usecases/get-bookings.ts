import type { Booking } from '../entities/booking';
import type { BookingRepository } from '../repositories/booking-repository';

/** Every booking, soonest departure first. */
export class GetBookings {
  constructor(private readonly repository: BookingRepository) {}

  async execute(): Promise<Booking[]> {
    const bookings = await this.repository.getBookings();
    return [...bookings].sort((a, b) => a.departureAt.localeCompare(b.departureAt));
  }
}
