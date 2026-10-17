import { DomainError } from '@/core/error/app-error';
import type { Booking, NewBooking } from '../../domain/entities/booking';
import { brandOf, type NewCard, type PaymentMethod } from '../../domain/entities/payment';
import type { BookingRepository, PaymentRepository } from '../../domain/repositories/booking-repository';
import type { BookingDataSource, PaymentDataSource } from '../datasources/booking-data-source';
import { toBooking, toCreateBookingDto, toPaymentMethod } from '../mappers/booking-mapper';

export class BookingRepositoryImpl implements BookingRepository {
  constructor(private readonly dataSource: BookingDataSource) {}

  async createBooking(booking: NewBooking): Promise<Booking> {
    return toBooking(await this.dataSource.createBooking(toCreateBookingDto(booking)));
  }

  async getBookings(): Promise<Booking[]> {
    return (await this.dataSource.getBookings()).map(toBooking);
  }

  async getBooking(id: string): Promise<Booking> {
    const dto = await this.dataSource.getBooking(id);
    if (!dto) {
      throw new DomainError('NOT_FOUND', `Booking ${id} was not found.`);
    }
    return toBooking(dto);
  }

  async cancelBooking(id: string): Promise<Booking> {
    const dto = await this.dataSource.updateStatus(id, 'cancelled');
    if (!dto) {
      throw new DomainError('NOT_FOUND', `Booking ${id} was not found.`);
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
      type: 'card',
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

  async charge(id: string, amount: number, currency: string): Promise<void> {
    const ok = await this.dataSource.charge(id, Math.round(amount * 100), currency);
    if (!ok) {
      throw new DomainError('VALIDATION', 'Not enough in your BlackJet Wallet. Choose a card instead.');
    }
  }
}
