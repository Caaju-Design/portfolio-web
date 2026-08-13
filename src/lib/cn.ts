/** Concatena classes ignorando valores falsy. Sem dependência externa. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
