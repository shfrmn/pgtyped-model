import {AnyPgTypedModule, AnyRowType, ParamType} from "./PgTyped"
import {WrapPromise} from "./Utils"

/**
 * Contains all information about a successful query
 */
interface QuerySummary<N, P, R, T> {
  queryName: N
  params: P
  rows: R[]
  result: T
}

/**
 * `onQuery` function type
 */
type OnQuery<N, P, R, T> = (queryResult: QuerySummary<N, P, R, T>) => any

/**
 *
 */
export type OnAnyQuery<QueryModule extends AnyPgTypedModule> = OnQuery<
  keyof QueryModule,
  ParamType<QueryModule[keyof QueryModule]>,
  AnyRowType<QueryModule>,
  any
>

/**
 *
 */
export type QueryFunction<P, T> = (params: P) => WrapPromise<T>

/**
 *
 */
export type MapQueryFunction<F, T> = QueryFunction<
  F extends QueryFunction<infer P, any>
    ? P
    : "MapQueryFunction<F ∉ QueryFunction>",
  T
>
