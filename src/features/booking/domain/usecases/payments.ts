import { DomainError } from '@/core/error/app-error';
import { validateNewCard, type NewCard, type PaymentMethod } from '../entities/payment';
import type { PaymentRepository } from '../repositories/booking-repository';

/** Default first, then the wallet, then cards. */
export class GetPaymentMethods {
  constructor(private readonly repository: PaymentRepository) {}

  async execute(): Promise<PaymentMethod[]> {
    const methods = await this.repository.getPaymentMethods();
    const rank = (method: PaymentMethod) => (method.isDefault ? 0 : method.kind === 'wallet' ? 1 : 2);
    return [...methods].sort((a, b) => rank(a) - rank(b));
  }
}

export class AddCard {
  constructor(
    private readonly repository: PaymentRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(card: NewCard): Promise<PaymentMethod> {
    const problem = validateNewCard(card, this.now());
    if (problem) {
      throw new DomainError('VALIDATION', problem);
    }
    return this.repository.addCard(card);
  }
}

export class SetDefaultPayment {
  constructor(private readonly repository: PaymentRepository) {}

  execute(id: string): Promise<PaymentMethod[]> {
    return this.repository.setDefault(id);
  }
}

export class RemoveCard {
  constructor(private readonly repository: PaymentRepository) {}

  async execute(id: string): Promise<PaymentMethod[]> {
    const methods = await this.repository.getPaymentMethods();
    const method = methods.find(item => item.id === id);
    if (method?.kind === 'wallet') {
      throw new DomainError('VALIDATION', 'The BlackJet Wallet cannot be removed.');
    }
    if (method?.isDefault) {
      throw new DomainError('VALIDATION', 'Choose another default before removing this card.');
    }
    return this.repository.removeCard(id);
  }
}
