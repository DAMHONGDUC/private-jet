import type { CharterLeg, JetQuote } from '../../domain/entities/charter';
import type { CharterRepository } from '../../domain/repositories/charter-repository';
import type { CharterDataSource } from '../datasources/charter-data-source';
import { toJetQuote } from '../mappers/charter-mapper';

export class CharterRepositoryImpl implements CharterRepository {
  constructor(private readonly dataSource: CharterDataSource) {}

  async getQuotes({ origin, destination, date, passengers }: CharterLeg): Promise<JetQuote[]> {
    const dtos = await this.dataSource.getQuotes({ origin, destination, date, passengers });
    return dtos.map(toJetQuote);
  }
}
