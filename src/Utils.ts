/**
 * Excludes void from a type
 */
export type NonVoid<T> = Exclude<T, void>

/**
 * Infers a type that can be used as an object key
 */
export type ObjectKey<T> = T extends string | number | symbol
  ? T
  : T extends boolean
  ? "true" | "false"
  : string

/**
 * Wraps type into a Promise if it's not already a Promise.
 * Allows to avoid nested Promise<Promise<...>> types.
 */
export type WrapPromise<P> = P extends Promise<any> ? P : Promise<P>

/**
 * Removes a Promise wrapper from a type, if present.
 */
export type UnwrapPromise<P> = P extends Promise<infer T> ? T : P

/**
 * Accepts two types. Preserves the first type if it's `void`,
 * otherwise falls back to the second type.
 */
export type WithVoid<MaybeVoid, IfNotVoid> = unknown extends IfNotVoid
  ? MaybeVoid
  : MaybeVoid extends void | Promise<void> | [] | Promise<[]>
  ? MaybeVoid
  : IfNotVoid
