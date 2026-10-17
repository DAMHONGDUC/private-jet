import type { BookingDto, BookingLegDto } from '../../models/booking-dto';
import type { PaymentMethodDto } from '../../models/payment-dto';

const PASSENGER = 'Alexander Reed';
const EMAIL = 'demo@blackjet.app';

function at(now: Date, days: number, hour: number, minutes = 0): string {
  const date = new Date(now);
  date.setDate(date.getDate() + days);
  date.setHours(hour, minutes, 0, 0);
  return date.toISOString();
}

const leg = (
  from: [string, string],
  to: [string, string],
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
  departure_time: departure,
  duration_minutes: minutes,
});

const GVA: [string, string] = ['GVA', 'Geneva'];
const NCE: [string, string] = ['NCE', 'Nice'];
const LBG: [string, string] = ['LBG', 'Paris'];
const OLB: [string, string] = ['OLB', 'Olbia'];
const FAB: [string, string] = ['FAB', 'London'];
const DXB: [string, string] = ['DXB', 'Dubai'];

/** An account with history: two upcoming trips, one flown and one cancelled. */
export function buildMockBookings(now: Date): BookingDto[] {
  const base = { contact_email: EMAIL, notes: '', created_at: at(now, -3, 10) };
  return [
    {
      ...base,
      id: 'bk-seed-1',
      pnr: 'BJ4F7Q',
      kind: 'seats',
      status: 'confirmed',
      legs: [leg(GVA, NCE, 'Embraer Praetor 600', at(now, 10, 13), 60, 'BJ-090')],
      passenger_names: [PASSENGER],
      total_cents: 240000,
      currency: 'EUR',
      payment_label: 'Visa •••• 4242',
    },
    {
      ...base,
      id: 'bk-seed-2',
      pnr: 'BJR8MX',
      kind: 'charter',
      status: 'confirmed',
      legs: [
        leg(FAB, NCE, 'Bombardier Challenger 350', at(now, 21, 9, 30), 125),
        leg(NCE, FAB, 'Bombardier Challenger 350', at(now, 25, 17), 125),
      ],
      passenger_names: [PASSENGER, 'Sophia Reed', 'Oliver Reed'],
      total_cents: 3300000,
      currency: 'EUR',
      payment_label: 'BlackJet Wallet',
      notes: 'Child seat for Oliver, please.',
    },
    {
      ...base,
      id: 'bk-seed-3',
      pnr: 'BJ2KQP',
      kind: 'charter',
      status: 'confirmed',
      legs: [leg(LBG, OLB, 'Gulfstream G280', at(now, -40, 11), 115)],
      passenger_names: [PASSENGER, 'Sophia Reed'],
      total_cents: 1640000,
      currency: 'EUR',
      payment_label: 'Amex •••• 1005',
      created_at: at(now, -60, 9),
    },
    {
      ...base,
      id: 'bk-seed-4',
      pnr: 'BJX5TN',
      kind: 'seats',
      status: 'cancelled',
      legs: [leg(GVA, DXB, 'Gulfstream G650ER', at(now, 6, 22), 375, 'BJ-105')],
      passenger_names: [PASSENGER],
      total_cents: 980000,
      currency: 'EUR',
      payment_label: 'Visa •••• 4242',
    },
  ];
}

export function buildMockPaymentMethods(): PaymentMethodDto[] {
  return [
    { id: 'pm-visa', type: 'card', brand: 'visa', last4: '4242', exp_month: 8, exp_year: 2029, holder: PASSENGER, balance_cents: null, currency: null, is_default: true },
    { id: 'pm-wallet', type: 'wallet', brand: null, last4: null, exp_month: null, exp_year: null, holder: PASSENGER, balance_cents: 2500000, currency: 'EUR', is_default: false },
    { id: 'pm-amex', type: 'card', brand: 'amex', last4: '1005', exp_month: 2, exp_year: 2028, holder: PASSENGER, balance_cents: null, currency: null, is_default: false },
  ];
}
