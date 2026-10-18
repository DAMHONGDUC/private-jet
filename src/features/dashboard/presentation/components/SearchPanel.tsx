import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useT, type Translate } from '@/core/i18n/i18n';
import { haptics } from '@/core/ui/haptics';
import { toDayKey } from '@/core/utils/date';
import { useGetAirportsQuery } from '@/features/flights/presentation/flights-api';
import {
  AirportEnd,
  LegSlot,
  MAX_CHARTER_PASSENGERS,
  checkDraft,
  draftFieldErrors,
  type CharterRequest,
  type DraftField,
  type LegTarget,
} from '../../domain/entities/charter';
import {
  airportSelected,
  airportsSwapped,
  dateSelected,
  legAdded,
  legRemoved,
  passengersSelected,
  returnDateSelected,
  selectCharterSearch,
  tripTypeSelected,
} from '../charter-search-slice';
import { airportsByCode } from '../search-labels';
import { AirportSheet } from './AirportSheet';
import { BookingCard } from './BookingCard';
import type { BookingCardErrors } from './booking-card-types';
import { CalendarSheet } from './CalendarSheet';
import { ConfirmSheet } from './ConfirmSheet';
import { CountSheet } from './CountSheet';

/** The sheets the form's fields open. */
enum SheetKind {
  Airport = 'airport',
  Date = 'date',
  ReturnDate = 'returnDate',
  Passengers = 'passengers',
  RemoveLeg = 'removeLeg',
}

type Sheet =
  | { kind: SheetKind.Airport; target: LegTarget; end: AirportEnd }
  | { kind: SheetKind.Date; target: LegTarget }
  | { kind: SheetKind.ReturnDate }
  | { kind: SheetKind.Passengers; target: LegTarget }
  | { kind: SheetKind.RemoveLeg; index: number }
  | null;

/** The leg a date belongs to: a leg, or the way back of a return trip. */
type DateTarget = LegTarget | LegSlot.Return;

type Props = {
  /** The form passed its checks. */
  onSearch: (request: CharterRequest) => void;
  /** The first thing missing, in the original app's words; each field also shows its own problem. */
  onInvalid?: (message: string) => void;
  /** The first day the calendar allows; tests pin it. */
  today: Date;
};

const legName = (target: LegTarget, t: Translate) =>
  target === LegSlot.Outbound
    ? ''
    : t('search.legPrefix', { number: target + 1 });

/** The booking card wired to the store, with the sheets its fields open. */
export function SearchPanel({ onSearch, onInvalid, today }: Props) {
  const dispatch = useDispatch();
  const t = useT();
  const { draft, recentAirports } = useSelector(selectCharterSearch);
  const { data: airports } = useGetAirportsQuery();
  const byCode = useMemo(() => airportsByCode(airports), [airports]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [submitted, setSubmitted] = useState(false);
  const close = () => setSheet(null);
  const todayKey = toDayKey(today);

  // Opening a field is quiet; the haptics are kept for choices that land.
  const open = (next: Sheet) => setSheet(next);

  const legAt = (target: LegTarget) =>
    target === LegSlot.Outbound ? draft.outbound : draft.legs[target];

  /** A leg cannot leave before the one it follows; the way back not before the way out. */
  const minDayFor = (target: DateTarget): string => {
    if (target === LegSlot.Return) {
      return draft.outbound.date ?? todayKey;
    }
    if (target === LegSlot.Outbound || target === 0) {
      return todayKey;
    }
    return draft.legs[target - 1]?.date ?? todayKey;
  };

  const find = () => {
    haptics.selection();
    const result = checkDraft(draft);
    if (result.request) {
      setSubmitted(false);
      onSearch(result.request);
    } else {
      setSubmitted(true);
      haptics.error();
      onInvalid?.(result.error);
    }
  };

  // Problems show under their fields once Find was tapped, and clear as each is fixed.
  const problems = submitted ? draftFieldErrors(draft) : {};
  const errors: BookingCardErrors = {};
  for (const [field, problem] of Object.entries(problems)) {
    if (problem) {
      errors[field as DraftField] = t(`validation.${problem}`);
    }
  }

  const dateTarget: DateTarget | null =
    sheet?.kind === SheetKind.Date
      ? sheet.target
      : sheet?.kind === SheetKind.ReturnDate
      ? LegSlot.Return
      : null;

  return (
    <>
      <BookingCard
        draft={draft}
        airports={byCode}
        errors={errors}
        onTripType={type => {
          setSubmitted(false);
          dispatch(tripTypeSelected(type));
        }}
        onPickAirport={(target, end) =>
          open({ kind: SheetKind.Airport, target, end })
        }
        onSwap={target => dispatch(airportsSwapped(target))}
        onPickDate={target => open({ kind: SheetKind.Date, target })}
        onPickReturnDate={() => open({ kind: SheetKind.ReturnDate })}
        onPickPassengers={target =>
          open({ kind: SheetKind.Passengers, target })
        }
        onAddLeg={() => dispatch(legAdded())}
        onRemoveLeg={index => open({ kind: SheetKind.RemoveLeg, index })}
        onFind={find}
      />

      <AirportSheet
        visible={sheet?.kind === SheetKind.Airport}
        title={
          sheet?.kind === SheetKind.Airport
            ? `${legName(sheet.target, t)}${t(
                sheet.end === AirportEnd.Origin ? 'search.from' : 'search.to',
              )}`
            : ''
        }
        airports={airports}
        recent={recentAirports}
        onPick={code => {
          if (sheet?.kind === SheetKind.Airport) {
            dispatch(
              airportSelected({ target: sheet.target, end: sheet.end, code }),
            );
          }
          close();
        }}
        onClose={close}
      />

      <CalendarSheet
        visible={dateTarget !== null}
        title={
          dateTarget === LegSlot.Return
            ? t('search.returnDate')
            : dateTarget !== null
            ? `${legName(dateTarget, t)}${t('search.departureDate')}`
            : ''
        }
        today={today}
        minDay={dateTarget !== null ? minDayFor(dateTarget) : todayKey}
        value={
          dateTarget === LegSlot.Return
            ? draft.returnDate
            : dateTarget !== null
            ? legAt(dateTarget)?.date ?? null
            : null
        }
        onPick={day => {
          haptics.light();
          if (dateTarget === LegSlot.Return) {
            dispatch(returnDateSelected(day));
          } else if (dateTarget !== null) {
            dispatch(dateSelected({ target: dateTarget, date: day }));
          }
          close();
        }}
        onClose={close}
      />

      <CountSheet
        visible={sheet?.kind === SheetKind.Passengers}
        title={
          sheet?.kind === SheetKind.Passengers
            ? `${legName(sheet.target, t)}${t('search.passengerCountTitle')}`
            : ''
        }
        value={
          sheet?.kind === SheetKind.Passengers
            ? legAt(sheet.target)?.passengers ?? 0
            : 0
        }
        max={MAX_CHARTER_PASSENGERS}
        onDone={count => {
          if (sheet?.kind === SheetKind.Passengers) {
            dispatch(passengersSelected({ target: sheet.target, count }));
          }
          close();
        }}
        onClose={close}
      />

      <ConfirmSheet
        visible={sheet?.kind === SheetKind.RemoveLeg}
        title={
          sheet?.kind === SheetKind.RemoveLeg
            ? t('search.removeLegTitle', { number: sheet.index + 1 })
            : ''
        }
        message={t('search.removeLegMessage')}
        confirmLabel={t('search.remove')}
        onConfirm={() => {
          if (sheet?.kind === SheetKind.RemoveLeg) {
            haptics.light();
            dispatch(legRemoved(sheet.index));
          }
          close();
        }}
        onClose={close}
      />
    </>
  );
}
