/**
 * Utility function to conditionally combine CSS class names.
 * Filters out falsy values (false, null, undefined, "") and joins strings with a space.
 *
 * Example:
 *   cn("base-class", isActive && "active-class", isSmall ? "text-sm" : "text-base")
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
