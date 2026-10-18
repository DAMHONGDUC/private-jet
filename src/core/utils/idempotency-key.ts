const HEX = '0123456789abcdef';

/**
 * A random v4-shaped UUID for the `Idempotency-Key` of one checkout attempt.
 * It only has to be unique per member, not secret, so `Math.random` will do.
 */
export function newIdempotencyKey(random: () => number = Math.random): string {
  const hex = (count: number) =>
    Array.from({ length: count }, () => HEX[Math.floor(random() * 16)]).join(
      '',
    );
  const variant = HEX[8 + Math.floor(random() * 4)];
  return `${hex(8)}-${hex(4)}-4${hex(3)}-${variant}${hex(3)}-${hex(12)}`;
}
