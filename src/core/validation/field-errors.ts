/** What is wrong with each field of a form, keyed by field; empty when all is well. */
export type FieldErrors<K extends string> = Partial<Record<K, string>>;

/** The first problem among `errors`, in the order the fields are listed. */
export function firstError<K extends string>(
  errors: FieldErrors<K>,
  order: readonly K[],
): string | null {
  for (const field of order) {
    const problem = errors[field];
    if (problem) {
      return problem;
    }
  }
  return null;
}

export const hasErrors = (errors: Partial<Record<string, string>>) =>
  Object.values(errors).some(Boolean);
