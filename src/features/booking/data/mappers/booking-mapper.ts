import type { Booking, NewBooking } from '../../domain/entities/booking';
import type { BookingDto, CreateBookingDto } from '../models/booking-dto';

export function toBooking(dto: BookingDto): Booking {
  return {
    id: dto.id,
    reference: dto.pnr,
    flightId: dto.flight_id,
    originCode: dto.origin_iata,
    originCity: dto.origin_city,
    destinationCode: dto.destination_iata,
    destinationCity: dto.destination_city,
    aircraftModel: dto.aircraft_model,
    departureAt: dto.departure_time,
    durationMinutes: dto.duration_minutes,
    passengers: dto.passenger_names.map(fullName => ({ fullName })),
    contactEmail: dto.contact_email,
    totalPrice: dto.total_cents / 100,
    currency: dto.currency,
    bookedAt: dto.created_at,
  };
}

export function toCreateBookingDto(booking: NewBooking): CreateBookingDto {
  return {
    flight_id: booking.flightId,
    origin_iata: booking.originCode,
    origin_city: booking.originCity,
    destination_iata: booking.destinationCode,
    destination_city: booking.destinationCity,
    aircraft_model: booking.aircraftModel,
    departure_time: booking.departureAt,
    duration_minutes: booking.durationMinutes,
    passenger_names: booking.passengers.map(passenger => passenger.fullName),
    contact_email: booking.contactEmail,
    total_cents: Math.round(booking.totalPrice * 100),
    currency: booking.currency,
  };
}
