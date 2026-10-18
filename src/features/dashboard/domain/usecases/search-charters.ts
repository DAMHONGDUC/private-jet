import { AppErrorCode, DomainError } from '@/core/error/app-error';
import { toDayKey } from '@/core/utils/date';
import type { CharterRequest, LegQuotes } from '../entities/charter';
import type { CharterRepository } from '../repositories/charter-repository';

/** Quotes for every leg of a request, cheapest first. */
export class SearchCharters {
  constructor(
    private readonly repository: CharterRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(request: CharterRequest): Promise<LegQuotes[]> {
    if (request.legs.length === 0) {
      throw new DomainError(
        AppErrorCode.Validation,
        'A charter needs at least one leg.',
      );
    }
    const today = toDayKey(this.now());
    if (request.legs.some(leg => leg.date < today)) {
      throw new DomainError(
        AppErrorCode.Validation,
        'Flight legs cannot depart in the past.',
      );
    }

    return Promise.all(
      request.legs.map(async leg => {
        const quotes = await this.repository.getQuotes(leg);
        return { leg, quotes: [...quotes].sort((a, b) => a.price - b.price) };
      }),
    );
  }
}
