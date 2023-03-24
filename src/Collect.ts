import {ObjectKey, UnwrapPromise} from "./Utils"

/**
 *
 */
export type CollectFunction<R, T> = (results: R) => T

/**
 *
 */
export type CollectResult<F> = F extends CollectFunction<any, infer T>
  ? UnwrapPromise<T>
  : "CollectResult<F ∉ CollectFunction>"

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
export function mapWithEntity<R, T>(Entity: {
  new (data: R): T
}): CollectFunction<R[], T[]> {
  return function (results: R[]): T[] {
    return results.map((result) => new Entity(result))
  }
}

/**
 *
 */
function indexBy<R, K extends keyof R>(
  results: R[],
  field: K,
): Record<ObjectKey<R[K]>, R[]> {
  const resultsByField = {} as Record<ObjectKey<R[K]>, R[]>
  for (const resultItem of results) {
    const key = resultItem[field] as ObjectKey<R[K]>
    resultsByField[key] ||= []
    resultsByField[key].push(resultItem)
  }
  return resultsByField
}

/**
 * Produces a collect function that reduces an array of result items
 * into an object, indexing them by the provided field.
 * Optional second argument allows to map each result item.
 */
export function indexWith<R, K extends keyof R, T = R[]>(
  field: K,
  collect?: CollectFunction<R[], T>,
): CollectFunction<R[], Record<ObjectKey<R[K]>, T>> {
  return function (results: R[]): Record<ObjectKey<R[K]>, T> {
    const resultsByField = indexBy(results, field) as Record<ObjectKey<R[K]>, T>
    if (!collect) {
      return resultsByField
    }
    for (const key in resultsByField) {
      resultsByField[key as ObjectKey<R[K]>] = collect(
        resultsByField[key as ObjectKey<R[K]>] as R[],
      )
    }
    return resultsByField
  }
}

/**
 * Produces a collect function that reduces an array of result items
 * into an array, grouping them by the provided field.
 */
export function groupWith<R, K extends keyof R, T = R[]>(
  field: K,
  collect?: CollectFunction<R[], T>,
): CollectFunction<R[], T[]> {
  return function (results: R[]): T[] {
    const resultsByField = indexBy(results, field)
    if (!collect) {
      return Object.values(resultsByField)
    }
    const groupedResults: T[] = []
    for (const key in resultsByField) {
      groupedResults.push(collect(resultsByField[key as ObjectKey<R[K]>]))
    }
    return groupedResults
  }
}
