import toCamelCase from "lodash/camelCase"
import mapKeys from "lodash/mapKeys"

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
export function mapKeysToCamelCase<T extends object>(obj: T): CamelCaseKeys<T> {
  return mapKeys(obj, (_, k) => toCamelCase(k)) as CamelCaseKeys<T>
}
