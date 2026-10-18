import {
  checkDraft,
  DRAFT_MESSAGES,
  draftFieldErrors,
  emptyDraftLeg,
  TripType,
  type CharterDraft,
  type DraftLeg,
} from '@/features/dashboard/domain/entities/charter';

const leg = (overrides: Partial<DraftLeg> = {}): DraftLeg => ({
  origin: 'GVA',
  destination: 'NCE',
  date: '2026-10-20',
  passengers: 2,
  ...overrides,
});

const draft = (overrides: Partial<CharterDraft> = {}): CharterDraft => ({
  tripType: TripType.OneWay,
  outbound: leg(),
  returnDate: null,
  legs: [],
  ...overrides,
});

describe('checkDraft', () => {
  it.each([
    [{ origin: null }, DRAFT_MESSAGES.noOrigin],
    [{ destination: null }, DRAFT_MESSAGES.noDestination],
    [{ destination: 'GVA' }, DRAFT_MESSAGES.sameAirports],
    [{ date: null }, DRAFT_MESSAGES.noDate],
    [{ passengers: 0 }, DRAFT_MESSAGES.noPassengers],
  ])('names the first missing field of %j', (missing, message) => {
    expect(checkDraft(draft({ outbound: leg(missing) }))).toEqual({
      error: message,
    });
  });

  it('turns a one-way form into one leg', () => {
    expect(checkDraft(draft()).request).toEqual({
      tripType: TripType.OneWay,
      legs: [
        {
          origin: 'GVA',
          destination: 'NCE',
          date: '2026-10-20',
          passengers: 2,
        },
      ],
    });
  });

  it('adds the way back to a round trip, and checks its date', () => {
    expect(checkDraft(draft({ tripType: TripType.RoundTrip }))).toEqual({
      error: DRAFT_MESSAGES.noReturnDate,
    });
    expect(
      checkDraft(
        draft({ tripType: TripType.RoundTrip, returnDate: '2026-10-19' }),
      ),
    ).toEqual({
      error: DRAFT_MESSAGES.returnBeforeDeparture,
    });

    expect(
      checkDraft(
        draft({ tripType: TripType.RoundTrip, returnDate: '2026-10-20' }),
      ).request?.legs[1],
    ).toEqual({
      origin: 'NCE',
      destination: 'GVA',
      date: '2026-10-20',
      passengers: 2,
    });
  });

  it('numbers the leg at fault on a multi-city trip and keeps the legs in order', () => {
    const first = leg();
    expect(
      checkDraft(
        draft({ tripType: TripType.MultiCity, legs: [first, emptyDraftLeg()] }),
      ),
    ).toEqual({
      error: `Leg #2: ${DRAFT_MESSAGES.noOrigin}`,
    });
    expect(
      checkDraft(
        draft({
          tripType: TripType.MultiCity,
          legs: [
            first,
            leg({ origin: 'NCE', destination: 'OLB', date: '2026-10-19' }),
          ],
        }),
      ),
    ).toEqual({ error: DRAFT_MESSAGES.legsOutOfOrder });

    const second = leg({
      origin: 'NCE',
      destination: 'OLB',
      date: '2026-10-22',
    });
    expect(
      checkDraft(draft({ tripType: TripType.MultiCity, legs: [first, second] }))
        .request?.legs,
    ).toHaveLength(2);
  });
});

describe('draftFieldErrors', () => {
  it('names every empty field at once, not just the first', () => {
    expect(draftFieldErrors(draft({ outbound: emptyDraftLeg() }))).toEqual({
      'outbound.origin': 'noOrigin',
      'outbound.destination': 'noDestination',
      'outbound.date': 'noDate',
      'outbound.passengers': 'noPassengers',
    });
  });

  it('is empty for a complete search', () => {
    expect(draftFieldErrors(draft())).toEqual({});
  });

  it('puts the return problems on the return date', () => {
    expect(draftFieldErrors(draft({ tripType: TripType.RoundTrip }))).toEqual({
      'return.date': 'noReturnDate',
    });
    expect(
      draftFieldErrors(
        draft({ tripType: TripType.RoundTrip, returnDate: '2026-10-19' }),
      ),
    ).toEqual({ 'return.date': 'returnBeforeDeparture' });
  });

  it('keys multi-city problems by leg', () => {
    const errors = draftFieldErrors(
      draft({
        tripType: TripType.MultiCity,
        legs: [
          leg(),
          leg({ origin: 'NCE', destination: 'NCE', date: '2026-10-19' }),
        ],
      }),
    );
    expect(errors).toEqual({
      'leg1.destination': 'sameAirports',
      'leg1.date': 'legsOutOfOrder',
    });
  });
});

test('a chosen time travels with its leg, and the way back keeps its own', () => {
  const request = checkDraft(
    draft({
      tripType: TripType.RoundTrip,
      outbound: leg({ time: '09:30' }),
      returnDate: '2026-10-22',
      returnTime: '18:00',
    }),
  ).request;
  expect(request?.legs.map(item => item.time)).toEqual(['09:30', '18:00']);
  // Any time leaves the field out, so the request reads as before.
  expect(checkDraft(draft()).request?.legs[0]).not.toHaveProperty('time');
});
