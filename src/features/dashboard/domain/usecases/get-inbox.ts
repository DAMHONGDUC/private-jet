import type { Inbox } from '../entities/dashboard';
import type { DashboardRepository } from '../repositories/dashboard-repository';

export class GetInbox {
  constructor(private readonly repository: DashboardRepository) {}

  execute(): Promise<Inbox> {
    return this.repository.getInbox();
  }
}
