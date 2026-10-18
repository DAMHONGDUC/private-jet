/** A suggested route as the backend would send it. */
export type PopularRouteDto = {
  id: string;
  origin_iata: string;
  origin_city: string;
  destination_iata: string;
  destination_city: string;
  duration_min: number;
  from_price: number;
  currency: string;
  image_key: string;
};
