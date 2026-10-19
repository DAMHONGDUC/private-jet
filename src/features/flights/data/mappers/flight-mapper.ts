import type { Airport, Flight } from '../../domain/entities/flight';
import type { AirportDto } from '../models/airport-dto';
import type { FlightDto } from '../models/flight-dto';

export function toFlight(dto: FlightDto): Flight {
  const departure = new Date(dto.departure_time).getTime();
  const arrival = new Date(dto.arrival_time).getTime();

  return {
    id: dto.id,
    operator: dto.operator_name,
    aircraft: {
      model: dto.aircraft_model,
      category: dto.aircraft_category,
      totalSeats: dto.aircraft_seats,
    },
    origin: { code: dto.origin_iata, city: dto.origin_city, name: dto.origin_airport },
    destination: {
      code: dto.destination_iata,
      city: dto.destination_city,
      name: dto.destination_airport,
    },
    departureAt: dto.departure_time,
    arrivalAt: dto.arrival_time,
    durationMinutes: Math.round((arrival - departure) / 60_000),
    pricePerSeat: dto.price_per_seat_cents / 100,
    currency: dto.currency,
    seatsAvailable: dto.seats_left,
    amenities: dto.amenities,
  };
}

export function toAirport(dto: AirportDto): Airport {
  return { code: dto.iata, city: dto.city, name: dto.name, timeZone: dto.tz };
}
