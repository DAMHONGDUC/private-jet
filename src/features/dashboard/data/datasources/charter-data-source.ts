import type { JetQuoteDto } from '../models/jet-quote-dto';

export type QuoteQuery = { origin: string; destination: string; date: string; passengers: number };

/** Where charter quotes come from. Today a mock; tomorrow an HTTP client. */
export interface CharterDataSource {
  getQuotes(query: QuoteQuery): Promise<JetQuoteDto[]>;
}
