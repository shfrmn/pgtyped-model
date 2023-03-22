import _groupBy from "lodash/groupBy"
import _mapValues from "lodash/mapValues"

/**
 * Converts any type to a type that can be used as an object key
 */
type ObjectKey<T> = T extends string | number | symbol
  ? T
  : T extends boolean
  ? "true" | "false"
  : string

/**
 *
 */
export type CollectFunction<R, T> = (results: R) => T

/**
 *
 */
export type CollectResult<T> = T extends CollectFunction<any, infer T>
  ? T
  : "CollectResult<T ∉ CollectFunction>"

/**
 * Produces a collect function that returns a single result item,
 * located at the specified position in the array.
 * If no position is specified, the function will return the first item.
 */
export function takeOne<T>(
  index: number = 0,
): CollectFunction<T[], T | undefined> {
  return function (results: T[]): T | undefined {
    return results.at(index)
  }
}

/**
 * Returns a collect function that maps each result item in the array using standard `.map` method
 */
export function mapWith<R, T>(
  callback: (resultItem: R) => T,
): CollectFunction<R[], T[]> {
  return function (results: R[]): T[] {
    return results.map(callback)
  }
}

/**
 *
 */
type GroupBy<R, K extends keyof R> = CollectFunction<
  R[],
  Record<ObjectKey<R[K]>, R[]>
>
type GroupByMap<R, K extends keyof R, T> = CollectFunction<
  R[],
  Record<ObjectKey<R[K]>, T>
>
type AnyGroupBy<R, K extends keyof R, T> = CollectFunction<
  R[],
  Record<ObjectKey<R[K]>, R[]> | Record<ObjectKey<R[K]>, T>
>

/**
 * Produces a collect function that reduces an array of result items
 * into an object, grouping them by the provided field.
 * Optional second argument allows to map each result item.
 */
export function groupWith<R, K extends keyof R>(field: K): GroupBy<R, K>
export function groupWith<R, K extends keyof R, T>(
  field: K,
  mapRows: (rows: R[]) => T,
): GroupByMap<R, K, T>
export function groupWith<R, K extends keyof R, T>(
  field: K,
  mapRows?: (rows: R[]) => T,
): AnyGroupBy<R, K, T> {
  function groupRows(
    rows: R[],
  ): Record<ObjectKey<R[K]>, R[]> | Record<ObjectKey<R[K]>, T> {
    const rowsByField = _groupBy(rows, field) as Record<ObjectKey<R[K]>, R[]>
    const mappedRowsByField = mapRows
      ? (_mapValues(rowsByField, mapRows) as Record<ObjectKey<R[K]>, T>)
      : rowsByField
    return mappedRowsByField
  }
  return groupRows
}

/**
 * Produces a collect function that reduces an array of result items
 * into an array, grouping them by the provided field.
 */
export function nestWith<R, K extends keyof R, T>(
  field: K,
  mapRows: (rows: R[]) => T,
): CollectFunction<R[], T[]> {
  return function nestRows(rows: R[]): T[] {
    const rowsByField = _groupBy(rows, field) as Record<K, R[]>
    const nestedRows = Object.values(rowsByField).map(mapRows)
    return nestedRows
  }
}
