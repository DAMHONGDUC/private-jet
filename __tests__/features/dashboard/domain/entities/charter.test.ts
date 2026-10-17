import {
  DRAFT_MESSAGES,
  checkDraft,
  emptyDraftLeg,
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
  tripType: 'oneWay',
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
    expect(checkDraft(draft({ outbound: leg(missing) }))).toEqual({ error: message });
  });

  it('turns a one-way form into one leg', () => {
    expect(checkDraft(draft()).request).toEqual({
      tripType: 'oneWay',
      legs: [{ origin: 'GVA', destination: 'NCE', date: '2026-10-20', passengers: 2 }],
    });
  });

  it('adds the way back to a round trip, and checks its date', () => {
    expect(checkDraft(draft({ tripType: 'roundTrip' }))).toEqual({ error: DRAFT_MESSAGES.noReturnDate });
    expect(checkDraft(draft({ tripType: 'roundTrip', returnDate: '2026-10-19' }))).toEqual({
      error: DRAFT_MESSAGES.returnBeforeDeparture,
    });

    expect(checkDraft(draft({ tripType: 'roundTrip', returnDate: '2026-10-20' })).request?.legs[1]).toEqual({
      origin: 'NCE',
      destination: 'GVA',
      date: '2026-10-20',
      passengers: 2,
    });
  });

  it('numbers the leg at fault on a multi-city trip and keeps the legs in order', () => {
    const first = leg();
    expect(checkDraft(draft({ tripType: 'multiCity', legs: [first, emptyDraftLeg()] }))).toEqual({
      error: `Leg #2: ${DRAFT_MESSAGES.noOrigin}`,
    });
    expect(
      checkDraft(draft({ tripType: 'multiCity', legs: [first, leg({ origin: 'NCE', destination: 'OLB', date: '2026-10-19' })] })),
    ).toEqual({ error: DRAFT_MESSAGES.legsOutOfOrder });

    const second = leg({ origin: 'NCE', destination: 'OLB', date: '2026-10-22' });
    expect(checkDraft(draft({ tripType: 'multiCity', legs: [first, second] })).request?.legs).toHaveLength(2);
  });
});
