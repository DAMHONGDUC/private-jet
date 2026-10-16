import { delay } from '@/core/utils/delay';
import type { BookingDto, CreateBookingDto } from '../models/booking-dto';
import type { BookingDataSource } from './booking-data-source';
import { buildMockBookings } from './mock/bookings.mock';

const PNR_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** In-memory bookings with a fake network delay; lives as long as the app. */
export class BookingMockDataSource implements BookingDataSource {
  private bookings: BookingDto[];
  private sequence = 0;

  constructor(
    private readonly latencyMs = 800,
    private readonly now: () => Date = () => new Date(),
    private readonly random: () => number = Math.random,
  ) {
    this.bookings = buildMockBookings(now());
  }

  async getBookings(): Promise<BookingDto[]> {
    await delay(this.latencyMs);
    return this.bookings.map(booking => ({ ...booking }));
  }

  async createBooking(booking: CreateBookingDto): Promise<BookingDto> {
    await delay(this.latencyMs);
    this.sequence += 1;

    const created: BookingDto = {
      ...booking,
      id: `bk-${this.sequence}`,
      pnr: this.nextPnr(),
      created_at: this.now().toISOString(),
    };
    this.bookings = [...this.bookings, created];
    return { ...created };
  }

  private nextPnr(): string {
    let pnr = 'BJ';
    for (let i = 0; i < 4; i += 1) {
      pnr += PNR_ALPHABET[Math.floor(this.random() * PNR_ALPHABET.length)];
    }
    return pnr;
  }
}
