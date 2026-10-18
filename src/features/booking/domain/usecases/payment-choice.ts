import { AppErrorCode, DomainError } from '@/core/error/app-error';
import type { PaymentMethod } from '../entities/payment';
import type { PaymentRepository } from '../repositories/booking-repository';

/** The chosen method, or the default one when none is chosen. */
export async function resolvePaymentMethod(
  payments: PaymentRepository,
  id?: string,
): Promise<PaymentMethod> {
  const methods = await payments.getPaymentMethods();
  const method = id
    ? methods.find(item => item.id === id)
    : methods.find(item => item.isDefault) ?? methods[0];
  if (!method) {
    throw new DomainError(
      AppErrorCode.Validation,
      'Add a payment method to book.',
    );
  }
  return method;
}
