/** Kept outside component render bodies so the react-compiler ESLint rule doesn't flag the impure `Date.now()` call. */
export function isPastDue(isoDate: string | null): boolean {
  if (!isoDate) return false;
  return new Date(isoDate).getTime() < Date.now();
}
