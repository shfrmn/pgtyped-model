import keyBy from "lodash/keyBy"
import groupBy from "lodash/groupBy"
import {PreparedQuery} from "@pgtyped/runtime"
import {IDatabaseConnection} from "@pgtyped/runtime/lib/tag"
import {mapKeysToCamelCase} from "./Camel"
import {OnAnyQuery, MapRows} from "./Hook"
import {ResultType} from "./PgTyped"

/**
 * Converts any type to a type that can be used as an object key
 */
type ObjectKey<T> = T extends string | number | symbol
  ? T
  : T extends boolean
  ? "true" | "false"
  : string

/**
 * Query-specific settings
 */
interface QueryOptions<P> {
  isUnique: boolean
  groupBy?: P
}

/**
 * Type matching `QueryOptions` of a "unique" query (used for type inference)
 */
interface UniqueQuery {
  isUnique: true
}

/**
 * Type matching `QueryOptions` of a "grouped" query (used for type inference)
 */
interface GroupedQuery<P> {
  groupBy: P
}

/**
 * Type of the final user-facing query function
 */
export type QueryFunction<P, T> = <
  O extends QueryOptions<keyof T>,
  GV = O extends GroupedQuery<infer K extends keyof T> ? T[K] : string,
  TT = O extends UniqueQuery
    ? T // Unique
    : T[], // Collection
>(
  params: P,
  options?: O,
) => Promise<
  T extends void
    ? void // Query that doesn't return rows (e.g. `DELETE`)
    : O extends GroupedQuery<keyof T>
    ? Record<ObjectKey<GV>, TT> // Grouped (unique or collection)
    : TT extends any[]
    ? TT // Array elements should be non-nullable
    : TT | undefined // Single entity should be nullable
>

/**
 *
 */
interface WrapQueryOptions {
  query: PreparedQuery<any, any>
  queryName: string
  camelCaseColumnNames: boolean
  connection: IDatabaseConnection
  onQuery?: OnAnyQuery<any, any>
  mapRows?: MapRows<any, any, any>
}

/**
 * Wraps the query with
 *  - `mapRows` function
 *  - `onQuery` hook
 *  - grouping logic
 *  - uniqueness logic
 */
export function wrapQuery<T>(
  options: WrapQueryOptions,
): QueryFunction<any, ResultType<any, T>> {
  const {query, queryName, camelCaseColumnNames, onQuery, mapRows, connection} =
    options
  const queryFunction = async function (
    params: any,
    options?: QueryOptions<string>,
  ) {
    const dbRows = await query.run(params, connection)
    const rows = camelCaseColumnNames ? dbRows.map(mapKeysToCamelCase) : dbRows
    const result = mapRows
      ? rows.map((row) => mapRows(row, queryName) as T)
      : (rows as T[])
    onQuery?.({
      queryName,
      params,
      rows,
      mappedRows: result,
    })
    if (options?.groupBy) {
      return options.isUnique
        ? keyBy(result, options.groupBy)
        : groupBy(result, options.groupBy)
    }
    return options?.isUnique ? result[0] : result
  }
  return queryFunction as QueryFunction<any, ResultType<any, T>>
}
