import type { PopularRoute } from '../../domain/entities/dashboard';
import type { PopularRouteDto } from '../models/popular-route-dto';

export function toPopularRoute(dto: PopularRouteDto): PopularRoute {
  return {
    id: dto.id,
    origin: dto.origin_iata,
    destination: dto.destination_iata,
    originCity: dto.origin_city,
    destinationCity: dto.destination_city,
    durationMinutes: dto.duration_min,
    fromPrice: dto.from_price,
    currency: dto.currency,
    image: dto.image_key,
  };
}
