import type { Booking, BookingLeg, NewBooking } from '../../domain/entities/booking';
import type { PaymentMethod } from '../../domain/entities/payment';
import type { BookingDto, BookingLegDto, CreateBookingDto } from '../models/booking-dto';
import type { PaymentMethodDto } from '../models/payment-dto';

function toLeg(dto: BookingLegDto): BookingLeg {
  return {
    ...(dto.flight_id ? { flightId: dto.flight_id } : {}),
    originCode: dto.origin_iata,
    originCity: dto.origin_city,
    destinationCode: dto.destination_iata,
    destinationCity: dto.destination_city,
    aircraftModel: dto.aircraft_model,
    departureAt: dto.departure_time,
    durationMinutes: dto.duration_minutes,
  };
}

function toLegDto(leg: BookingLeg): BookingLegDto {
  return {
    flight_id: leg.flightId ?? null,
    origin_iata: leg.originCode,
    origin_city: leg.originCity,
    destination_iata: leg.destinationCode,
    destination_city: leg.destinationCity,
    aircraft_model: leg.aircraftModel,
    departure_time: leg.departureAt,
    duration_minutes: leg.durationMinutes,
  };
}

export function toBooking(dto: BookingDto): Booking {
  return {
    id: dto.id,
    reference: dto.pnr,
    kind: dto.kind,
    status: dto.status,
    legs: dto.legs.map(toLeg),
    passengers: dto.passenger_names.map(fullName => ({ fullName })),
    contactEmail: dto.contact_email,
    totalPrice: dto.total_cents / 100,
    currency: dto.currency,
    paymentLabel: dto.payment_label,
    notes: dto.notes,
    bookedAt: dto.created_at,
  };
}

export function toCreateBookingDto(booking: NewBooking): CreateBookingDto {
  return {
    kind: booking.kind,
    legs: booking.legs.map(toLegDto),
    passenger_names: booking.passengers.map(passenger => passenger.fullName),
    contact_email: booking.contactEmail,
    total_cents: Math.round(booking.totalPrice * 100),
    currency: booking.currency,
    payment_label: booking.paymentLabel,
    notes: booking.notes,
  };
}

const pad = (value: number) => String(value).padStart(2, '0');

export function toPaymentMethod(dto: PaymentMethodDto): PaymentMethod {
  return {
    id: dto.id,
    kind: dto.type,
    ...(dto.brand ? { brand: dto.brand } : {}),
    ...(dto.last4 ? { last4: dto.last4 } : {}),
    ...(dto.exp_month && dto.exp_year ? { expiry: `${pad(dto.exp_month)}/${pad(dto.exp_year % 100)}` } : {}),
    holder: dto.holder,
    ...(dto.balance_cents !== null ? { balance: dto.balance_cents / 100 } : {}),
    ...(dto.currency ? { currency: dto.currency } : {}),
    isDefault: dto.is_default,
  };
}
