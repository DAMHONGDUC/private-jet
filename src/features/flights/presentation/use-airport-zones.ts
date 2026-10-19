import { useMemo } from 'react';
import { useGetAirportsQuery } from './flights-api';

/** Looks up an airport's IANA time zone by code; undefined until the airports load or for an unknown code. */
export function useAirportZones(): (code: string) => string | undefined {
  const { data: airports } = useGetAirportsQuery();
  return useMemo(() => {
    const zones = new Map(
      (airports ?? []).map(airport => [airport.code, airport.timeZone]),
    );
    return (code: string) => zones.get(code);
  }, [airports]);
}
