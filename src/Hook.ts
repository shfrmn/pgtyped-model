import {CamelCaseKeys} from "./Camel"
import {AnyPgTypedModule, AnyRowType, ParamType} from "./PgTyped"

/**
 * Contains all information about a successful query
 */
interface QuerySummary<P, R, T> {
  queryName: string
  params: P
  rows: R[]
  mappedRows: T[]
}

/**
 * `onQuery` function type
 */
export type OnAnyQuery<QM extends AnyPgTypedModule, T> = (
  queryResult: QuerySummary<ParamType<QM[keyof QM]>, AnyRowType<QM>, T>,
) => any

/**
 * `mapRows` function type
 */
export type MapRows<QM extends AnyPgTypedModule, T, IsCamelCase> = (
  row: IsCamelCase extends true
    ? CamelCaseKeys<AnyRowType<QM>>
    : AnyRowType<QM>,
  queryName: keyof QM,
) => T
