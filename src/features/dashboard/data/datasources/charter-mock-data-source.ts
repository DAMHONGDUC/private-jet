import { delay } from '@/core/utils/delay';
import type { JetQuoteDto } from '../models/jet-quote-dto';
import type { CharterDataSource, QuoteQuery } from './charter-data-source';
import { buildMockQuotes } from './mock/charter.mock';

/** Quotes computed from distance and a small fleet, after a fake network delay. */
export class CharterMockDataSource implements CharterDataSource {
  constructor(private readonly latencyMs = 900) {}

  async getQuotes(query: QuoteQuery): Promise<JetQuoteDto[]> {
    await delay(this.latencyMs);
    return buildMockQuotes(query);
  }
}
