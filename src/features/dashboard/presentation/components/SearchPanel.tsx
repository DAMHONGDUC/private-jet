import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { haptics } from '@/core/ui/haptics';
import { toDayKey } from '@/core/utils/date';
import { useGetAirportsQuery } from '@/features/flights/presentation/flights-api';
import { airportsByCode } from '@/features/flights/presentation/search-summary';
import { MAX_CHARTER_PASSENGERS, checkDraft, type CharterRequest } from '../../domain/entities/charter';
import {
  airportSelected,
  airportsSwapped,
  dateSelected,
  legAdded,
  legRemoved,
  passengersSelected,
  returnDateSelected,
  selectCharterSearch,
  selectDraftChanged,
  tripTypeSelected,
  type AirportEnd,
  type LegTarget,
} from '../charter-search-slice';
import { AirportSheet } from './AirportSheet';
import { BookingCard } from './BookingCard';
import { CalendarSheet } from './CalendarSheet';
import { ConfirmSheet } from './ConfirmSheet';
import { CountSheet } from './CountSheet';

type Sheet =
  | { kind: 'airport'; target: LegTarget; end: AirportEnd }
  | { kind: 'date'; target: LegTarget }
  | { kind: 'return' }
  | { kind: 'passengers'; target: LegTarget }
  | { kind: 'removeLeg'; index: number }
  | null;

type Props = {
  /** The form passed its checks. */
  onSearch: (request: CharterRequest) => void;
  /** The first thing missing, in the original app's words. */
  onInvalid: (message: string) => void;
  finding: boolean;
  /** The first day the calendar allows; tests pin it. */
  today: Date;
};

const legName = (target: LegTarget) => (target === 'outbound' ? '' : `Leg #${target + 1} · `);

/** The booking card wired to the store, with the sheets its fields open. */
export function SearchPanel({ onSearch, onInvalid, finding, today }: Props) {
  const dispatch = useDispatch();
  const { draft, recentAirports } = useSelector(selectCharterSearch);
  const changed = useSelector(selectDraftChanged);
  const { data: airports } = useGetAirportsQuery();
  const byCode = useMemo(() => airportsByCode(airports), [airports]);
  const [sheet, setSheet] = useState<Sheet>(null);
  const close = () => setSheet(null);
  const todayKey = toDayKey(today);

  const open = (next: Sheet) => {
    haptics.selection();
    setSheet(next);
  };

  const legAt = (target: LegTarget) => (target === 'outbound' ? draft.outbound : draft.legs[target]);

  /** A leg cannot leave before the one it follows; the way back not before the way out. */
  const minDayFor = (target: LegTarget | 'return'): string => {
    if (target === 'return') {
      return draft.outbound.date ?? todayKey;
    }
    if (target === 'outbound' || target === 0) {
      return todayKey;
    }
    return draft.legs[target - 1]?.date ?? todayKey;
  };

  const find = () => {
    haptics.selection();
    const result = checkDraft(draft);
    if (result.request) {
      onSearch(result.request);
    } else {
      onInvalid(result.error);
    }
  };

  const dateTarget = sheet?.kind === 'date' ? sheet.target : sheet?.kind === 'return' ? 'return' : null;

  return (
    <>
      <BookingCard
        draft={draft}
        airports={byCode}
        findLabel={changed ? 'Update Results' : 'Find Your Jet'}
        finding={finding}
        onTripType={type => dispatch(tripTypeSelected(type))}
        onPickAirport={(target, end) => open({ kind: 'airport', target, end })}
        onSwap={target => dispatch(airportsSwapped(target))}
        onPickDate={target => open({ kind: 'date', target })}
        onPickReturnDate={() => open({ kind: 'return' })}
        onPickPassengers={target => open({ kind: 'passengers', target })}
        onAddLeg={() => dispatch(legAdded())}
        onRemoveLeg={index => open({ kind: 'removeLeg', index })}
        onFind={find}
      />

      <AirportSheet
        visible={sheet?.kind === 'airport'}
        title={sheet?.kind === 'airport' ? `${legName(sheet.target)}${sheet.end === 'origin' ? 'From' : 'To'}` : ''}
        airports={airports}
        recent={recentAirports}
        onPick={code => {
          if (sheet?.kind === 'airport') {
            dispatch(airportSelected({ target: sheet.target, end: sheet.end, code }));
          }
          close();
        }}
        onClose={close}
      />

      <CalendarSheet
        visible={dateTarget !== null}
        title={
          dateTarget === 'return'
            ? 'Return Date'
            : dateTarget !== null
              ? `${legName(dateTarget)}Departure Date`
              : ''
        }
        today={today}
        minDay={dateTarget !== null ? minDayFor(dateTarget) : todayKey}
        value={dateTarget === 'return' ? draft.returnDate : dateTarget !== null ? (legAt(dateTarget)?.date ?? null) : null}
        onPick={day => {
          haptics.light();
          if (dateTarget === 'return') {
            dispatch(returnDateSelected(day));
          } else if (dateTarget !== null) {
            dispatch(dateSelected({ target: dateTarget, date: day }));
          }
          close();
        }}
        onClose={close}
      />

      <CountSheet
        visible={sheet?.kind === 'passengers'}
        title={sheet?.kind === 'passengers' ? `${legName(sheet.target)}Number of Passengers` : ''}
        value={sheet?.kind === 'passengers' ? (legAt(sheet.target)?.passengers ?? 0) : 0}
        max={MAX_CHARTER_PASSENGERS}
        onDone={count => {
          if (sheet?.kind === 'passengers') {
            dispatch(passengersSelected({ target: sheet.target, count }));
          }
          close();
        }}
        onClose={close}
      />

      <ConfirmSheet
        visible={sheet?.kind === 'removeLeg'}
        title={sheet?.kind === 'removeLeg' ? `Remove Flight Leg #${sheet.index + 1}` : ''}
        message="This leg and everything chosen for it will be removed from the trip."
        confirmLabel="Remove"
        onConfirm={() => {
          if (sheet?.kind === 'removeLeg') {
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
