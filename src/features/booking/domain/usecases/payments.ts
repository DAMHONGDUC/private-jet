import { AppErrorCode, DomainError } from '@/core/error/app-error';
import {
  PaymentMethodKind,
  validateNewCard,
  type NewCard,
  type PaymentMethod,
} from '../entities/payment';
import type { PaymentRepository } from '../repositories/booking-repository';

/** Default first, then the wallet, then cards. */
export class GetPaymentMethods {
  constructor(private readonly repository: PaymentRepository) {}

  async execute(): Promise<PaymentMethod[]> {
    const methods = await this.repository.getPaymentMethods();
    const rank = (method: PaymentMethod) =>
      method.isDefault ? 0 : method.kind === PaymentMethodKind.Wallet ? 1 : 2;
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
      throw new DomainError(AppErrorCode.Validation, problem);
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
    if (method?.kind === PaymentMethodKind.Wallet) {
      throw new DomainError(
        AppErrorCode.Validation,
        'The Sovereign Wallet cannot be removed.',
      );
    }
    if (method?.isDefault) {
      throw new DomainError(
        AppErrorCode.Validation,
        'Choose another default before removing this card.',
      );
    }
    return this.repository.removeCard(id);
  }
}
