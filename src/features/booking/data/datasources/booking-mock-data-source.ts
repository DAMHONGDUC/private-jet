import { AppErrorCode, DomainError } from '@/core/error/app-error';
import { PaymentMethodKind } from '@/features/booking/domain/entities/payment';
import { BookingStatus } from '@/features/booking/domain/entities/booking';
import { delay } from '@/core/utils/delay';
import { FlightMockDataSource } from '@/features/flights/data/datasources/flight-mock-data-source';
import { seatsShortMessage } from '@/features/flights/domain/entities/flight';
import type { BookingDto, PlaceBookingDto } from '../models/booking-dto';
import type { PaymentMethodDto } from '../models/payment-dto';
import type {
  BookingDataSource,
  PaymentDataSource,
} from './booking-data-source';
import {
  buildMockBookings,
  buildMockPaymentMethods,
} from './mock/bookings.mock';

const PNR_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** The other mock "tables" a booking touches; the composition root passes the ones the app reads. */
export type BookingMockBackend = {
  payments: PaymentMockDataSource;
  flights: FlightMockDataSource;
};

/**
 * In-memory bookings with a fake network delay; lives as long as the app.
 * Placing a booking plays the backend's part: it checks the seats, charges,
 * takes the seats and records the booking, in steps a server would run in
 * one transaction.
 */
export class BookingMockDataSource implements BookingDataSource {
  private bookings: BookingDto[];
  private sequence = 0;
  /** Bookings already placed, by idempotency key. */
  private placed = new Map<string, BookingDto>();
  private readonly backend: BookingMockBackend;

  constructor(
    private readonly latencyMs = 800,
    private readonly now: () => Date = () => new Date(),
    private readonly random: () => number = Math.random,
    backend?: BookingMockBackend,
  ) {
    this.bookings = buildMockBookings(now());
    this.backend = backend ?? {
      payments: new PaymentMockDataSource(0),
      flights: new FlightMockDataSource(0, now()),
    };
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

  async placeBooking(
    order: PlaceBookingDto,
    idempotencyKey: string,
  ): Promise<BookingDto> {
    const earlier = this.placed.get(idempotencyKey);
    if (earlier) {
      await delay(this.latencyMs);
      return copy(earlier);
    }

    const { payment_method_id: paymentMethodId, ...booking } = order;
    const seats = booking.passenger_names.length;
    const flights = await Promise.all(
      booking.legs.flatMap(leg =>
        leg.flight_id ? [this.backend.flights.getFlight(leg.flight_id)] : [],
      ),
    );
    for (const flight of flights) {
      if (!flight) {
        throw new DomainError(AppErrorCode.NotFound, 'This flight was not found.');
      }
      if (flight.seats_left < seats) {
        throw new DomainError(
          AppErrorCode.SoldOut,
          seatsShortMessage(flight.seats_left),
        );
      }
    }
    const paid = await this.backend.payments.charge(
      paymentMethodId,
      booking.total_cents,
    );
    if (!paid) {
      throw new DomainError(
        AppErrorCode.Validation,
        'Not enough in your Sovereign Wallet. Choose a card instead.',
      );
    }
    for (const flight of flights) {
      if (flight) {
        await this.backend.flights.updateSeatsLeft(
          flight.id,
          flight.seats_left - seats,
        );
      }
    }

    await delay(this.latencyMs);
    this.sequence += 1;
    const created: BookingDto = {
      ...booking,
      id: `bk-${this.sequence}`,
      pnr: this.nextPnr(),
      status: BookingStatus.Confirmed,
      created_at: this.now().toISOString(),
    };
    this.bookings = [...this.bookings, created];
    this.placed.set(idempotencyKey, created);
    return copy(created);
  }

  async updateStatus(
    id: string,
    status: BookingDto['status'],
  ): Promise<BookingDto | undefined> {
    await delay(this.latencyMs);
    this.bookings = this.bookings.map(item =>
      item.id === id ? { ...item, status } : item,
    );
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

const copy = (booking: BookingDto): BookingDto => ({
  ...booking,
  legs: booking.legs.map(leg => ({ ...leg })),
});

/** Two cards and a wallet; paying from the wallet lowers its balance. */
export class PaymentMockDataSource implements PaymentDataSource {
  private methods: PaymentMethodDto[] = buildMockPaymentMethods();
  private sequence = 0;

  constructor(private readonly latencyMs = 600) {}

  async getPaymentMethods(): Promise<PaymentMethodDto[]> {
    await delay(this.latencyMs);
    return this.methods.map(method => ({ ...method }));
  }

  async addCard(
    card: Omit<PaymentMethodDto, 'id' | 'is_default'>,
  ): Promise<PaymentMethodDto> {
    await delay(this.latencyMs);
    this.sequence += 1;
    const created = {
      ...card,
      id: `pm-new-${this.sequence}`,
      is_default: false,
    };
    this.methods = [...this.methods, created];
    return { ...created };
  }

  async setDefault(id: string): Promise<PaymentMethodDto[]> {
    await delay(this.latencyMs);
    this.methods = this.methods.map(method => ({
      ...method,
      is_default: method.id === id,
    }));
    return this.methods.map(method => ({ ...method }));
  }

  async removeCard(id: string): Promise<PaymentMethodDto[]> {
    await delay(this.latencyMs);
    this.methods = this.methods.filter(method => method.id !== id);
    return this.methods.map(method => ({ ...method }));
  }

  /** The mock backend's own bookkeeping: placing a booking pays through here. False when the method cannot cover the amount. */
  async charge(id: string, amountCents: number): Promise<boolean> {
    await delay(this.latencyMs);
    const method = this.methods.find(item => item.id === id);
    if (!method) {
      return false;
    }
    if (method.type === PaymentMethodKind.Wallet) {
      const balance = method.balance_cents ?? 0;
      if (balance < amountCents) {
        return false;
      }
      this.methods = this.methods.map(item =>
        item.id === id
          ? { ...item, balance_cents: balance - amountCents }
          : item,
      );
    }
    return true;
  }
}
