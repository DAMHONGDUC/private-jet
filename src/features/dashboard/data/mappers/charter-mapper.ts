import type { JetQuote } from '../../domain/entities/charter';
import type { JetQuoteDto } from '../models/jet-quote-dto';

export function toJetQuote(dto: JetQuoteDto): JetQuote {
  return {
    id: dto.quote_id,
    aircraft: { model: dto.aircraft_model, category: dto.aircraft_class, totalSeats: dto.aircraft_seats },
    specs: { cruiseKmh: dto.cruise_kmh, rangeKm: dto.range_km, baggageM3: dto.baggage_m3, cabin: dto.cabin },
    amenities: dto.amenities,
    photos: dto.photo_keys,
    nonStop: dto.non_stop,
    durationMinutes: dto.flight_minutes,
    price: dto.price_cents / 100,
    currency: dto.currency,
  };
}
