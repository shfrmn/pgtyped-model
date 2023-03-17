import {IDatabaseConnection} from "@pgtyped/runtime/lib/tag"
import {OnAnyQuery, MapRows} from "./Hook"
import {AnyPgTypedModule, ParamType, ResultType} from "./PgTyped"
import {QueryFunction, wrapQuery} from "./Query"

/**
 * Type of the model inferred from PgTyped generated module
 */
type Model<QM extends AnyPgTypedModule, T> = {
  [QueryName in keyof QM]: QueryFunction<
    ParamType<QM[QueryName]>,
    ResultType<QM[QueryName], T>
  >
}

/**
 *
 */
interface CreateModelOptions<
  QM extends AnyPgTypedModule,
  IsCamelCase extends boolean,
  T,
> {
  /**
   * PostgreSQL connection (`pool` or `client` from `pg` package)
   */
  connection: IDatabaseConnection

  /**
   * PgTyped generated query module.
   *
   * Example:
   * ```typescript
   * import * as queries from "./my-entity.queries.ts"
   * ```
   */
  queries: QM

  /**
   * Boolean flag indicating whether column names should be
   * converted to camelCase.
   *
   * __Attention:__ PgTyped feature with the same name __should be
   * turned off__ in the PgTyped config file, since it only converts
   * the types and not the actual values.
   */
  camelCaseColumnNames?: IsCamelCase

  /**
   * Optional transformer function to be applied to each row.
   *
   * ```typescript
   * // Example: convert each row to a class instance
   * mapRows: (postRow) => new Post(postRow)
   * ```
   *
   * __Attention:__
   * Only pass pure functions to `mapRows`. For any side
   * effects (e.g. logging) use `onQuery` hook instead.
   */
  mapRows?: MapRows<QM, T, IsCamelCase>

  /**
   * Optional function to be called after each successful query.
   * ```typescript
   * // Example: log each query
   * onQuery: ({queryName, params, rows, mappedRows}) => {
   *   console.log(`${queryName}(${JSON.stringify(params)}) -> ${rows.length} rows`)
   * }
   * ```
   *
   * __Attention:__
   * This hook is not meant for error handling. Please refer to
   * `pg` package [documentation](https://node-postgres.com/apis/pool#error)
   * for more details on error handling.
   */
  onQuery?: OnAnyQuery<QM, T>
}

/**
 * Creates a model from a PgTyped generated module
 */
export function createModel<
  QM extends AnyPgTypedModule,
  IsCamelCase extends boolean = false,
  T = "",
>(options: CreateModelOptions<QM, IsCamelCase, T>): Model<QM, T> {
  const {
    queries,
    connection,
    camelCaseColumnNames = false,
    onQuery,
    mapRows,
  } = options
  const model = {} as Record<keyof typeof queries, QueryFunction<any, any>>
  for (const queryName in queries) {
    const query = queries[queryName]
    model[queryName] = wrapQuery({
      connection,
      query,
      queryName,
      camelCaseColumnNames,
      onQuery,
      mapRows,
    })
  }
  return model as Model<QM, T>
}
