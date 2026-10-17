import { DomainError } from '@/core/error/app-error';
import { CANCELLATION_WINDOW_HOURS, canCancel, type Booking } from '../entities/booking';
import type { BookingRepository } from '../repositories/booking-repository';

export class GetBooking {
  constructor(private readonly repository: BookingRepository) {}

  execute(id: string): Promise<Booking> {
    return this.repository.getBooking(id);
  }
}

/** Cancels a confirmed booking up to 24 hours before its first departure. */
export class CancelBooking {
  constructor(
    private readonly repository: BookingRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(id: string): Promise<Booking> {
    const booking = await this.repository.getBooking(id);
    if (!canCancel(booking, this.now())) {
      throw new DomainError(
        'VALIDATION',
        booking.status === 'cancelled'
          ? 'This trip is already cancelled.'
          : `Trips can be cancelled up to ${CANCELLATION_WINDOW_HOURS} hours before departure.`,
      );
    }
    return this.repository.cancelBooking(id);
  }
}
