import type { CharterLeg, JetQuote } from '../entities/charter';

export interface CharterRepository {
  /** Every aircraft that can fly the leg with its party on board; empty when none can. */
  getQuotes(leg: CharterLeg): Promise<JetQuote[]>;
}
