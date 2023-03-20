import {IDatabaseConnection} from "@pgtyped/runtime/lib/tag"
import {
  AnyPgTypedModule,
  AnyRowType,
  ParamType,
  ResultType,
  RowType,
} from "./PgTyped"
import {CaseAware, mapKeysToCamelCase} from "./Camel"
import {OnAnyQuery, QueryFunction} from "./Query"
import {CollectFunction} from "./Collect"

/**
 * Type of the model inferred from PgTyped generated module
 */
type Model<M, DefaultResult, Override> = {
  [K in keyof M]: QueryFunction<
    ParamType<M[K]>,
    K extends keyof Override
      ? Override[K] extends (...args: any[]) => any
        ? ReturnType<Override[K]>
        : never
      : unknown extends DefaultResult
      ? ResultType<M[K]>
      : RowType<M[K]> extends void
      ? void
      : DefaultResult
  >
}

type PgTypedModel<QM> = {
  [K in keyof QM]: RowType<QM[K]>
}

/**
 *
 */
function fromPgTypedModule<QM extends AnyPgTypedModule>(
  queryModule: QM,
): Model<QM, never, PgTypedModel<QM>> {
  const model: Record<string, any> = {}
  for (const queryName in queryModule) {
    model[queryName] = queryModule[queryName].run
  }
  return model as Model<QM, never, PgTypedModel<QM>>
}

/**
 *
 */
type ExtendedModel<M, E> = {
  [K in keyof M | keyof E]: K extends keyof M & keyof E
    ? M[K] extends QueryFunction<infer P, any>
      ? E[K] extends (...args: any[]) => any
        ? QueryFunction<P, ReturnType<E[K]>>
        : "woosh"
      : "boom"
    : K extends keyof M
    ? M[K]
    : never
}

/**
 *
 */
function extendModel<M extends Model<any, any, any>, E>(
  model: M,
  extendModel: (results: any, queryName: keyof M, params: any) => any,
): ExtendedModel<M, E> {
  const extendedModel = {} as Record<string, any>
  for (const queryName in model) {
    extendedModel[queryName] = (params: any) => {
      return model[queryName](params).then((results) => {
        return extendModel(results, queryName, params)
      })
    }
  }
  return extendedModel as ExtendedModel<M, E>
}

/**
 *
 */
type ExtendOptions<M extends Model<any, any, any>> = Partial<{
  [K in keyof M]: (
    results: M[K] extends QueryFunction<any, infer T> ? T : never,
  ) => any
}>

/**
 *
 */
type ExtendableModel<M, T, E> = Model<M, T, E> & {
  extend: <O extends ExtendOptions<Model<M, T, E>>>(
    options: O,
  ) => ExtendedModel<Model<M, T, E>, O>
}

/**
 *
 */
type CollectDefault<
  QM extends AnyPgTypedModule,
  IsCamelCase,
  T,
> = CollectFunction<CaseAware<AnyRowType<QM>, IsCamelCase>[], T>

/**
 *
 */
type OverrideOptions<QM extends AnyPgTypedModule, IsCamelCase> = Partial<{
  [QN in keyof QM]: (rows: CaseAware<RowType<QM[QN]>, IsCamelCase>[]) => any
}>

/**
 *
 */
export interface CreateModelOptions<
  QM extends AnyPgTypedModule,
  IsCamelCase extends boolean,
  CR,
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
   *
   */
  collectDefault?: CollectDefault<QM, IsCamelCase, CR>

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
  onQuery?: OnAnyQuery<QM>
}

/**
 *
 */
export function createModel<
  QM extends AnyPgTypedModule,
  IsCamelCase extends boolean,
  CR,
  Override extends OverrideOptions<QM, IsCamelCase> = {},
>(
  options: CreateModelOptions<QM, IsCamelCase, CR, Override>,
): ExtendableModel<QM, CR, Override> {
  const baseModel = fromPgTypedModule(options.queries)
  const model = extendModel(
    baseModel,
    (rows, queryName: string, params: any) => {
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
  ) as Model<QM, CR, Override>

  function extend<O extends ExtendOptions<Model<QM, CR, Override>>>(
    options: O,
  ): ExtendedModel<Model<QM, CR, Override>, O> {
    return extendModel<Model<QM, CR, Override>, O>(model, (rows, queryName) => {
      return options[queryName]?.(rows) || rows
    })
  }

  return {...model, extend}
}
