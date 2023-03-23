/**
 *
 */
type CamelCase<S extends string> =
  S extends `${infer P1}_${infer P2}${infer P3}`
    ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
    : S

/**
 *
 */
export type CamelCaseKeys<O extends Record<string, any>> = {
  [K in keyof O as CamelCase<string & K>]: O[K]
}

/**
 *
 */
export type CaseAware<T, IsCamelCase = false> = IsCamelCase extends false
  ? T
  : T extends Record<string, any>
  ? CamelCaseKeys<T>
  : T

/**
 *
 */
function toCamelCase(s: string): string {
  return s.replace(/(\w)_(\w)/g, (s) => s[0] + s[2].toUpperCase())
}

/**
 *
 */
export function mapKeysToCamelCase<T extends object>(obj: T): CamelCaseKeys<T> {
  const result = {} as Record<string, any>
  for (let key in obj) {
    result[toCamelCase(key)] = obj[key]
  }
  return result as CamelCaseKeys<T>
}
