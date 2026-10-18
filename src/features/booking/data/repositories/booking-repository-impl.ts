import { AppErrorCode, DomainError } from '@/core/error/app-error';
import {
  BookingStatus,
  type Booking,
  type BookingOrder,
} from '../../domain/entities/booking';
import {
  brandOf,
  PaymentMethodKind,
  type NewCard,
  type PaymentMethod,
} from '../../domain/entities/payment';
import type {
  BookingRepository,
  PaymentRepository,
} from '../../domain/repositories/booking-repository';
import type {
  BookingDataSource,
  PaymentDataSource,
} from '../datasources/booking-data-source';
import {
  toBooking,
  toPaymentMethod,
  toPlaceBookingDto,
} from '../mappers/booking-mapper';

export class BookingRepositoryImpl implements BookingRepository {
  constructor(private readonly dataSource: BookingDataSource) {}

  async placeBooking(order: BookingOrder): Promise<Booking> {
    return toBooking(
      await this.dataSource.placeBooking(
        toPlaceBookingDto(order),
        order.idempotencyKey,
      ),
    );
  }

  async getBookings(): Promise<Booking[]> {
    return (await this.dataSource.getBookings()).map(toBooking);
  }

  async getBooking(id: string): Promise<Booking> {
    const dto = await this.dataSource.getBooking(id);
    if (!dto) {
      throw new DomainError(
        AppErrorCode.NotFound,
        `Booking ${id} was not found.`,
      );
    }
    return toBooking(dto);
  }

  async cancelBooking(id: string): Promise<Booking> {
    const dto = await this.dataSource.updateStatus(id, BookingStatus.Cancelled);
    if (!dto) {
      throw new DomainError(
        AppErrorCode.NotFound,
        `Booking ${id} was not found.`,
      );
    }
    return toBooking(dto);
  }
}

export class PaymentRepositoryImpl implements PaymentRepository {
  constructor(private readonly dataSource: PaymentDataSource) {}

  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return (await this.dataSource.getPaymentMethods()).map(toPaymentMethod);
  }

  async addCard({ holder, number, expiry }: NewCard): Promise<PaymentMethod> {
    const digits = number.replace(/\D/g, '');
    const [month, year] = expiry.split('/').map(Number);
    const dto = await this.dataSource.addCard({
      type: PaymentMethodKind.Card,
      brand: brandOf(digits),
      last4: digits.slice(-4),
      exp_month: month,
      exp_year: 2000 + year,
      holder: holder.trim(),
      balance_cents: null,
      currency: null,
    });
    return toPaymentMethod(dto);
  }

  async setDefault(id: string): Promise<PaymentMethod[]> {
    return (await this.dataSource.setDefault(id)).map(toPaymentMethod);
  }

  async removeCard(id: string): Promise<PaymentMethod[]> {
    return (await this.dataSource.removeCard(id)).map(toPaymentMethod);
  }
}
