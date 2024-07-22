export function subsetOf<T>(a: Set<T>, b: Set<T>): boolean {
  if ("isSubsetOf" in a) return (a.isSubsetOf as (s: Set<T>) => boolean)(b);
  if (a.size > b.size) return false;
  return [...a].every((v) => b.has(v));
}
