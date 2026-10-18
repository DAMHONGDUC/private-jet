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
  currency: 'EUR',
  image_key,
});

/** Airports the airport sheet offers, so a tapped route always fills the form. */
export function buildMockRoutes(): PopularRouteDto[] {
  return [
    route('r1', ['GVA', 'Geneva'], ['NCE', 'Nice'], 55, 6900, 'jet-1'),
    route('r2', ['FAB', 'London'], ['LBG', 'Paris'], 60, 7400, 'jet-2'),
    route('r3', ['LBG', 'Paris'], ['OLB', 'Olbia'], 110, 11800, 'jet-3'),
    route('r4', ['GVA', 'Geneva'], ['DXB', 'Dubai'], 380, 38500, 'jet-4'),
  ];
}
