import type { PopularRouteDto } from '../../models/popular-route-dto';

const route = (
  id: string,
  [origin_iata, origin_city]: [string, string],
  [destination_iata, destination_city]: [string, string],
  duration_min: number,
  from_price: number,
  image_key: string,
): PopularRouteDto => ({
  id,
  origin_iata,
  origin_city,
  destination_iata,
  destination_city,
  duration_min,
  from_price,
  currency: 'AUD',
  image_key,
});

/** Airports the airport sheet offers, so a tapped route always fills the form. */
export function buildMockRoutes(): PopularRouteDto[] {
  return [
    route('r1', ['SYD', 'Sydney'], ['MEB', 'Melbourne'], 85, 14900, 'jet-1'),
    route(
      'r2',
      ['BNE', 'Brisbane'],
      ['HTI', 'Hamilton Island'],
      100,
      17800,
      'jet-2',
    ),
    route(
      'r3',
      ['MEB', 'Melbourne'],
      ['OOL', 'Gold Coast'],
      140,
      23600,
      'jet-3',
    ),
    route('r4', ['SYD', 'Sydney'], ['SIN', 'Singapore'], 480, 98500, 'jet-4'),
  ];
}
