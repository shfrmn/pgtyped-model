import {AnyPgTypedModule, AnyRowType, ParamType} from "./PgTyped"

/**
 * Contains all information about a successful query
 */
interface QuerySummary<P, R, T> {
  queryName: string
  params: P
  rows: R[]
  result: T
}

/**
 * `onQuery` function type
 */
type OnQuery<P, R, T> = (queryResult: QuerySummary<P, R, T>) => any

/**
 *
 */
export type OnAnyQuery<QM> = OnQuery<
  QM extends AnyPgTypedModule ? ParamType<QM[keyof QM]> : never,
  QM extends AnyPgTypedModule ? AnyRowType<QM> : never,
  any
>

/**
 *
 */
export type QueryFunction<P, T> = (params: P) => Promise<T>
