import { BookingKind, BookingStatus } from '../../../domain/entities/booking';
import { CardBrand, PaymentMethodKind } from '../../../domain/entities/payment';
import type { BookingDto, BookingLegDto } from '../../models/booking-dto';
import type { PaymentMethodDto } from '../../models/payment-dto';
import { instantAt, wallClockIn } from '@/core/utils/date';

const PASSENGER = 'Alexander Reed';
const EMAIL = 'demo@sovereign.app';

function at(now: Date, days: number, hour: number, minutes = 0): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(hour, minutes, 0, 0);
  return date.toISOString();
}

/** An airport: IATA code, city, IANA time zone. */
type Place = [string, string, string];

const leg = (
  from: Place,
  to: Place,
  aircraft: string,
  departure: string,
  minutes: number,
  flightId: string | null = null,
): BookingLegDto => ({
  flight_id: flightId,
  origin_iata: from[0],
  origin_city: from[1],
  destination_iata: to[0],
  destination_city: to[1],
  aircraft_model: aircraft,
  // `at` reads the device's clock; a leg leaves at that time by its own airport's clock.
  departure_time: instantAt(
    wallClockIn(new Date(departure)).day,
    wallClockIn(new Date(departure)).time,
    from[2],
  ).toISOString(),
  duration_minutes: minutes,
});

const SYD: Place = ['SYD', 'Sydney', 'Australia/Sydney'];
const MEB: Place = ['MEB', 'Melbourne', 'Australia/Melbourne'];
const OOL: Place = ['OOL', 'Gold Coast', 'Australia/Brisbane'];
const HTI: Place = ['HTI', 'Hamilton Island', 'Australia/Brisbane'];
const BNE: Place = ['BNE', 'Brisbane', 'Australia/Brisbane'];
const SIN: Place = ['SIN', 'Singapore', 'Asia/Singapore'];

/** An account with history: two upcoming trips, one flown and one cancelled. */
export function buildMockBookings(now: Date): BookingDto[] {
  const base = { contact_email: EMAIL, notes: '', created_at: at(now, -3, 10) };
  return [
    {
      ...base,
      id: 'bk-seed-1',
      pnr: 'BJ4F7Q',
      kind: BookingKind.Seats,
      status: BookingStatus.Confirmed,
      legs: [
        leg(SYD, MEB, 'Embraer Praetor 600', at(now, 10, 13), 85, 'BJ-090'),
      ],
      passenger_names: [PASSENGER],
      total_cents: 396000,
      currency: 'AUD',
      payment_label: 'Visa •••• 4242',
    },
    {
      ...base,
      id: 'bk-seed-2',
      pnr: 'BJR8MX',
      kind: BookingKind.Charter,
      status: BookingStatus.Confirmed,
      legs: [
        leg(BNE, HTI, 'Bombardier Challenger 350', at(now, 21, 9, 30), 100),
        leg(HTI, BNE, 'Bombardier Challenger 350', at(now, 25, 17), 100),
      ],
      passenger_names: [PASSENGER, 'Sophia Reed', 'Oliver Reed'],
      total_cents: 5450000,
      currency: 'AUD',
      payment_label: 'Sovereign Wallet',
      notes: 'Child seat for Oliver, please.',
    },
    {
      ...base,
      id: 'bk-seed-3',
      pnr: 'BJ2KQP',
      kind: BookingKind.Charter,
      status: BookingStatus.Confirmed,
      legs: [leg(MEB, OOL, 'Gulfstream G280', at(now, -40, 11), 140)],
      passenger_names: [PASSENGER, 'Sophia Reed'],
      total_cents: 2700000,
      currency: 'AUD',
      payment_label: 'Amex •••• 1005',
      created_at: at(now, -60, 9),
    },
    {
      ...base,
      id: 'bk-seed-4',
      pnr: 'BJX5TN',
      kind: BookingKind.Seats,
      status: BookingStatus.Cancelled,
      legs: [leg(SYD, SIN, 'Gulfstream G650ER', at(now, 6, 22), 480, 'BJ-105')],
      passenger_names: [PASSENGER],
      total_cents: 1620000,
      currency: 'AUD',
      payment_label: 'Visa •••• 4242',
    },
  ];
}

export function buildMockPaymentMethods(): PaymentMethodDto[] {
  return [
    {
      id: 'pm-visa',
      type: PaymentMethodKind.Card,
      brand: CardBrand.Visa,
      last4: '4242',
      exp_month: 8,
      exp_year: 2029,
      holder: PASSENGER,
      balance_cents: null,
      currency: null,
      is_default: true,
    },
    {
      id: 'pm-wallet',
      type: PaymentMethodKind.Wallet,
      brand: null,
      last4: null,
      exp_month: null,
      exp_year: null,
      holder: PASSENGER,
      balance_cents: 4000000,
      currency: 'AUD',
      is_default: false,
    },
    {
      id: 'pm-amex',
      type: PaymentMethodKind.Card,
      brand: CardBrand.Amex,
      last4: '1005',
      exp_month: 2,
      exp_year: 2028,
      holder: PASSENGER,
      balance_cents: null,
      currency: null,
      is_default: false,
    },
  ];
}
