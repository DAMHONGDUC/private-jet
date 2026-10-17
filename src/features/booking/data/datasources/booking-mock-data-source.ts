import { delay } from '@/core/utils/delay';
import type { BookingDto, CreateBookingDto } from '../models/booking-dto';
import type { PaymentMethodDto } from '../models/payment-dto';
import type { BookingDataSource, PaymentDataSource } from './booking-data-source';
import { buildMockBookings, buildMockPaymentMethods } from './mock/bookings.mock';

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
    return this.bookings.map(copy);
  }

  async getBooking(id: string): Promise<BookingDto | undefined> {
    await delay(this.latencyMs);
    const booking = this.bookings.find(item => item.id === id);
    return booking ? copy(booking) : undefined;
  }

  async createBooking(booking: CreateBookingDto): Promise<BookingDto> {
    await delay(this.latencyMs);
    this.sequence += 1;

    const created: BookingDto = {
      ...booking,
      id: `bk-${this.sequence}`,
      pnr: this.nextPnr(),
      status: 'confirmed',
      created_at: this.now().toISOString(),
    };
    this.bookings = [...this.bookings, created];
    return copy(created);
  }

  async updateStatus(id: string, status: BookingDto['status']): Promise<BookingDto | undefined> {
    await delay(this.latencyMs);
    this.bookings = this.bookings.map(item => (item.id === id ? { ...item, status } : item));
    const booking = this.bookings.find(item => item.id === id);
    return booking ? copy(booking) : undefined;
  }

  private nextPnr(): string {
    let pnr = 'BJ';
    for (let i = 0; i < 4; i += 1) {
      pnr += PNR_ALPHABET[Math.floor(this.random() * PNR_ALPHABET.length)];
    }
    return pnr;
  }
}

const copy = (booking: BookingDto): BookingDto => ({ ...booking, legs: booking.legs.map(leg => ({ ...leg })) });

/** Two cards and a wallet; paying from the wallet lowers its balance. */
export class PaymentMockDataSource implements PaymentDataSource {
  private methods: PaymentMethodDto[] = buildMockPaymentMethods();
  private sequence = 0;

  constructor(private readonly latencyMs = 600) {}

  async getPaymentMethods(): Promise<PaymentMethodDto[]> {
    await delay(this.latencyMs);
    return this.methods.map(method => ({ ...method }));
  }

  async addCard(card: Omit<PaymentMethodDto, 'id' | 'is_default'>): Promise<PaymentMethodDto> {
    await delay(this.latencyMs);
    this.sequence += 1;
    const created = { ...card, id: `pm-new-${this.sequence}`, is_default: false };
    this.methods = [...this.methods, created];
    return { ...created };
  }

  async setDefault(id: string): Promise<PaymentMethodDto[]> {
    await delay(this.latencyMs);
    this.methods = this.methods.map(method => ({ ...method, is_default: method.id === id }));
    return this.methods.map(method => ({ ...method }));
  }

  async removeCard(id: string): Promise<PaymentMethodDto[]> {
    await delay(this.latencyMs);
    this.methods = this.methods.filter(method => method.id !== id);
    return this.methods.map(method => ({ ...method }));
  }

  async charge(id: string, amountCents: number): Promise<boolean> {
    await delay(this.latencyMs);
    const method = this.methods.find(item => item.id === id);
    if (!method) {
      return false;
    }
    if (method.type === 'wallet') {
      const balance = method.balance_cents ?? 0;
      if (balance < amountCents) {
        return false;
      }
      this.methods = this.methods.map(item => (item.id === id ? { ...item, balance_cents: balance - amountCents } : item));
    }
    return true;
  }
}
