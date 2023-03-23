import {IDatabaseConnection} from "@pgtyped/runtime/lib/tag"
import {AnyPgTypedModule, AnyRowType, ParamType, ResultType} from "./PgTyped"
import {CaseAware, mapKeysToCamelCase} from "./CaseAware"
import {MapQueryFunction, OnAnyQuery, QueryFunction} from "./Query"
import {CollectFunction, CollectResult} from "./Collect"
import {UnwrapPromise, WithVoid} from "./Utils"

/**
 *
 */
type AnyModel = Model<any, any, any>

/**
 * `Model` represents an object where keys are inferred from a
 * PgTyped generated module and values are of type `QueryFunction`
 */
type Model<
  M extends Model<any, any, any>,
  DefaultCollectResult,
  CollectOverride,
> = {
  [K in keyof M]: MapQueryFunction<
    M[K],
    K extends keyof CollectOverride // Empty CollectOverride or when contains matching key
      ? unknown extends CollectResult<CollectOverride[K]> // Empty CollectOverride
        ? WithVoid<CollectResult<M[K]>, DefaultCollectResult> // => Base model
        : CollectResult<CollectOverride[K]> // => CollectOverride
      : WithVoid<CollectResult<M[K]>, DefaultCollectResult> // => Base model
  >
}

/**
 * Converts PgTyped query module into `Model`
 */
export type FromPgTyped<QueryModule, IsCamelCase> = {
  [K in keyof QueryModule]: QueryFunction<
    ParamType<QueryModule[K]>,
    ResultType<QueryModule[K], IsCamelCase>
  >
}

/**
 *
 */
function fromPgTypedModule<QueryModule extends AnyPgTypedModule, IsCamelCase>(
  queryModule: QueryModule,
  connection: IDatabaseConnection,
): FromPgTyped<QueryModule, IsCamelCase> {
  const model: Record<string, any> = {}
  for (const queryName in queryModule) {
    model[queryName] = (params: any) => {
      return queryModule[queryName].run(params, connection)
    }
  }
  return model as FromPgTyped<QueryModule, IsCamelCase>
}

/**
 *
 */
type ExtendedModel<M extends AnyModel, E extends ExtendOptions<M>> = {
  [K in keyof M | keyof E]: K extends keyof M & keyof E
    ? MapQueryFunction<M[K], CollectResult<E[K]>>
    : K extends keyof M
    ? M[K]
    : "ExtendedModel<K ∉ keyof M>"
}

/**
 *
 */
function extendModel<M extends AnyModel, E extends ExtendOptions<M>>(
  model: M,
  extendModel: (results: any, queryName: keyof M, params: any) => any,
): ExtendedModel<M, E> {
  const extendedModel = {} as Record<string, any>
  for (const queryName in model) {
    extendedModel[queryName] = (params: any) => {
      return model[queryName](params).then((results: any) => {
        return extendModel(results, queryName, params)
      })
    }
  }
  return extendedModel as ExtendedModel<M, E>
}

/**
 *
 */
type ExtendOptions<M extends AnyModel> = Partial<{
  [K in keyof M]: (
    results: M[K] extends QueryFunction<any, infer T>
      ? UnwrapPromise<T>
      : "ExtendOptions<M[K] ∉ QueryFunction>",
  ) => any
}>

/**
 *
 */
type ExtendableModel<M extends AnyModel> = M & {
  extend: <O extends ExtendOptions<M>>(options: O) => ExtendedModel<M, O>
}

/**
 *
 */
type CollectDefault<
  QueryModule extends AnyPgTypedModule,
  IsCamelCase,
  T,
> = CollectFunction<CaseAware<AnyRowType<QueryModule>, IsCamelCase>[], T>

/**
 *
 */
type OverrideOptions<QueryModule extends AnyPgTypedModule, IsCamelCase> = {
  [K in keyof QueryModule]?: CollectFunction<
    ResultType<QueryModule[K], IsCamelCase>,
    unknown
  >
}

/**
 *
 */
export interface CreateModelOptions<
  QueryModule extends AnyPgTypedModule,
  IsCamelCase extends boolean,
  DefaultCollectResult,
  CollectOverride,
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
  queries: QueryModule

  /**
   * Boolean flag indicating whether column names should be
   * converted to camelCase.
   *
   * __Attention:__ PgTyped feature with the same name __should be
   * turned off__ in the PgTyped config file, since it only converts
   * the types and not the actual values.
   */
  camelCaseColumnNames: IsCamelCase

  /**
   *
   */
  collectDefault?: CollectDefault<
    QueryModule,
    IsCamelCase,
    DefaultCollectResult
  >

  /**
   *
   */
  collect?: CollectOverride

  /**
   * Optional function to be called after each successful query.
   *
   * __Attention:__
   * This hook is not meant for error handling. Please refer to
   * `pg` package [documentation](https://node-postgres.com/apis/pool#error)
   * for more details on error handling.
   *
   * Example:
   * ```typescript
   * onQuery: ({queryName, params, rows, results}) => {
   *   console.log(`${queryName}(${JSON.stringify(params)}) -> ${rows.length} rows`)
   * }
   * ```
   */
  onQuery?: OnAnyQuery<QueryModule>
}

/**
 *
 */
export function createModel<
  QueryModule extends AnyPgTypedModule,
  DefaultCollectResult,
  IsCamelCase extends boolean,
  CollectOverride extends OverrideOptions<
    QueryModule,
    IsCamelCase
  > = OverrideOptions<QueryModule, IsCamelCase>,
  M extends AnyModel = Model<
    FromPgTyped<QueryModule, IsCamelCase>,
    DefaultCollectResult,
    CollectOverride
  >,
>(
  options: CreateModelOptions<
    QueryModule,
    IsCamelCase,
    DefaultCollectResult,
    CollectOverride
  >,
): ExtendableModel<M> {
  const baseModel = fromPgTypedModule(options.queries, options.connection)
  const model = extendModel(
    baseModel,
    (rows, queryName: keyof QueryModule, params: any) => {
      const caseAwareRows = options.camelCaseColumnNames
        ? rows.map(mapKeysToCamelCase)
        : rows
      const collect = options.collect?.[queryName] || options.collectDefault
      const result = collect ? collect(caseAwareRows) : caseAwareRows
      options.onQuery?.({
        queryName,
        params,
        rows,
        result,
      })
      return result
    },
  ) as unknown as M

  function extend<O extends ExtendOptions<M>>(options: O): ExtendedModel<M, O> {
    return extendModel(model, (rows, queryName) => {
      return options[queryName]?.(rows) || rows
    })
  }

  return {...model, extend}
}
