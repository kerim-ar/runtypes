declare module 'types/literal' {
	import { Runtype } from 'runtype';
	/**
	 * The super type of all literal types.
	 */
	export type LiteralBase = undefined | null | boolean | number | string;
	export interface Literal<A extends LiteralBase> extends Runtype<A> {
	    tag: 'literal';
	    value: A;
	}
	/**
	 * Construct a runtype for a type literal.
	 */
	export function Literal<A extends LiteralBase>(valueBase: A): Literal<A>;
	/**
	 * An alias for Literal(undefined).
	 */
	export const Undefined: Literal<undefined>;
	/**
	 * An alias for Literal(null).
	 */
	export const Null: Literal<null>;

}
declare module 'types/string' {
	import { Runtype } from 'runtype';
	export interface String extends Runtype<string> {
	    tag: 'string';
	}
	/**
	 * Validates that a value is a string.
	 */
	export const String: String;

}
declare module 'types/unknown' {
	import { Runtype } from 'runtype';
	export interface Unknown extends Runtype {
	    tag: 'unknown';
	}
	/**
	 * Validates anything, but provides no new type information about it.
	 */
	export const Unknown: Unknown;

}
declare module 'types/constraint' {
	import { Runtype, Static } from 'runtype';
	import { Unknown } from 'types/unknown';
	export type ConstraintCheck<A extends Runtype> = (x: Static<A>) => boolean | string;
	export interface Constraint<A extends Runtype, T extends Static<A> = Static<A>, K = unknown> extends Runtype<T> {
	    tag: 'constraint';
	    underlying: A;
	    constraint(x: Static<A>): boolean | string;
	    name?: string;
	    args?: K;
	}
	export function Constraint<A extends Runtype, T extends Static<A> = Static<A>, K = unknown>(underlying: A, constraint: ConstraintCheck<A>, options?: {
	    name?: string;
	    args?: K;
	}): Constraint<A, T, K>;
	export const Guard: <T, K = unknown>(guard: (x: unknown) => x is T, options?: {
	    name?: string | undefined;
	    args?: K | undefined;
	} | undefined) => Constraint<Unknown, T, K>;

}
declare module 'types/instanceof' {
	import { Runtype } from 'runtype';
	export interface Constructor<V> {
	    new (...args: any[]): V;
	}
	export interface InstanceOf<V> extends Runtype<V> {
	    tag: 'instanceof';
	    ctor: Constructor<V>;
	}
	export function InstanceOf<V>(ctor: Constructor<V>): InstanceOf<V>;

}
declare module 'reflect' {
	import { Runtype } from 'runtype';
	import { LiteralBase } from 'types/literal';
	import { ConstraintCheck } from 'types/constraint';
	import { Constructor } from 'types/instanceof';
	export type Reflect = ({
	    tag: 'unknown';
	} & Runtype) | ({
	    tag: 'never';
	} & Runtype<never>) | ({
	    tag: 'void';
	} & Runtype<void>) | ({
	    tag: 'boolean';
	} & Runtype<boolean>) | ({
	    tag: 'number';
	} & Runtype<number>) | ({
	    tag: 'string';
	} & Runtype<string>) | ({
	    tag: 'symbol';
	} & Runtype<symbol>) | ({
	    tag: 'literal';
	    value: LiteralBase;
	} & Runtype<LiteralBase>) | ({
	    tag: 'array';
	    element: Reflect;
	    isReadonly: boolean;
	} & Runtype<ReadonlyArray<unknown>>) | ({
	    tag: 'record';
	    fields: {
	        [_: string]: Reflect;
	    };
	    isReadonly: boolean;
	} & Runtype<{
	    readonly [_ in string]: unknown;
	}>) | ({
	    tag: 'partial';
	    fields: {
	        [_: string]: Reflect;
	    };
	} & Runtype<{
	    [_ in string]?: unknown;
	}>) | ({
	    tag: 'dictionary';
	    key: 'string' | 'number';
	    value: Reflect;
	} & Runtype<{
	    [_: string]: unknown;
	}>) | ({
	    tag: 'tuple';
	    components: Reflect[];
	} & Runtype<unknown[]>) | ({
	    tag: 'union';
	    alternatives: Reflect[];
	} & Runtype) | ({
	    tag: 'intersect';
	    intersectees: Reflect[];
	} & Runtype) | ({
	    tag: 'function';
	} & Runtype<(...args: any[]) => any>) | ({
	    tag: 'constraint';
	    underlying: Reflect;
	    constraint: ConstraintCheck<Runtype<never>>;
	    args?: any;
	    name?: string;
	} & Runtype) | ({
	    tag: 'instanceof';
	    ctor: Constructor<unknown>;
	} & Runtype) | ({
	    tag: 'brand';
	    brand: string;
	    entity: Reflect;
	} & Runtype);

}
declare module 'show' {
	import { Reflect } from 'index'; const _default: (refl: Reflect) => string;
	export default _default;

}
declare module 'errors' {
	export class ValidationError extends Error {
	    message: string;
	    key?: string | undefined;
	    name: string;
	    constructor(message: string, key?: string | undefined);
	}

}
declare module 'runtype' {
	import { Result, Union2, Intersect2, Constraint, ConstraintCheck, Brand } from 'index';
	import { Reflect } from 'reflect';
	/**
	 * A runtype determines at runtime whether a value conforms to a type specification.
	 */
	export interface Runtype<A = unknown> {
	    /**
	     * Verifies that a value conforms to this runtype. If so, returns the same value,
	     * statically typed. Otherwise throws an exception.
	     */
	    check(x: any): A;
	    /**
	     * Validates that a value conforms to this type, and returns a result indicating
	     * success or failure (does not throw).
	     */
	    validate(x: any): Result<A>;
	    /**
	     * A type guard for this runtype.
	     */
	    guard(x: any): x is A;
	    /**
	     * Union this Runtype with another.
	     */
	    Or<B extends Runtype>(B: B): Union2<this, B>;
	    /**
	     * Intersect this Runtype with another.
	     */
	    And<B extends Runtype>(B: B): Intersect2<this, B>;
	    /**
	     * Use an arbitrary constraint function to validate a runtype, and optionally
	     * to change its name and/or its static type.
	     *
	     * @template T - Optionally override the static type of the resulting runtype
	     * @param {(x: Static<this>) => boolean | string} constraint - Custom function
	     * that returns `true` if the constraint is satisfied, `false` or a custom
	     * error message if not.
	     * @param [options]
	     * @param {string} [options.name] - allows setting the name of this
	     * constrained runtype, which is helpful in reflection or diagnostic
	     * use-cases.
	     */
	    withConstraint<T extends Static<this>, K = unknown>(constraint: ConstraintCheck<this>, options?: {
	        name?: string;
	        args?: K;
	    }): Constraint<this, T, K>;
	    /**
	     * Helper function to convert an underlying Runtype into another static type
	     * via a type guard function.  The static type of the runtype is inferred from
	     * the type of the guard function.
	     *
	     * @template T - Typically inferred from the return type of the type guard
	     * function, so usually not needed to specify manually.
	     * @param {(x: Static<this>) => x is T} guard - Type guard function (see
	     * https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards)
	     *
	     * @param [options]
	     * @param {string} [options.name] - allows setting the name of this
	     * constrained runtype, which is helpful in reflection or diagnostic
	     * use-cases.
	     */
	    withGuard<T extends Static<this>, K = unknown>(guard: (x: Static<this>) => x is T, options?: {
	        name?: string;
	        args?: K;
	    }): Constraint<this, T, K>;
	    /**
	     * Adds a brand to the type.
	     */
	    withBrand<B extends string>(brand: B): Brand<B, this>;
	    /**
	     * Convert this to a Reflect, capable of introspecting the structure of the type.
	     */
	    reflect: Reflect;
	    _falseWitness: A;
	}
	/**
	 * Obtains the static type associated with a Runtype.
	 */
	export type Static<A extends Runtype> = A['_falseWitness'];
	export function create<A extends Runtype>(validate: (x: any) => Result<Static<A>>, A: any): A;

}
declare module 'result' {
	/**
	 * A successful validation result.
	 */
	export type Success<T> = {
	    /**
	     * A tag indicating success.
	     */
	    success: true;
	    /**
	     * The original value, cast to its validated type.
	     */
	    value: T;
	};
	/**
	 * A failed validation result.
	 */
	export type Failure = {
	    /**
	     * A tag indicating failure.
	     */
	    success: false;
	    /**
	     * A message indicating the reason validation failed.
	     */
	    message: string;
	    /**
	     * A key indicating the location at which validation failed.
	     */
	    key?: string;
	};
	/**
	 * The result of a type validation.
	 */
	export type Result<T> = Success<T> | Failure;

}
declare module 'match' {
	import { Runtype as Rt, Case, Matcher10, Matcher9, Matcher8, Matcher7, Matcher6, Matcher5, Matcher4, Matcher3, Matcher1, Matcher2 } from '.';
	export function match<A extends Rt, Z>(a: PairCase<A, Z>): Matcher1<A, Z>;
	export function match<A extends Rt, B extends Rt, Z>(a: PairCase<A, Z>, b: PairCase<B, Z>): Matcher2<A, B, Z>;
	export function match<A extends Rt, B extends Rt, C extends Rt, Z>(a: PairCase<A, Z>, b: PairCase<B, Z>, c: PairCase<C, Z>): Matcher3<A, B, C, Z>;
	export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, Z>(a: PairCase<A, Z>, b: PairCase<B, Z>, c: PairCase<C, Z>, d: PairCase<D, Z>): Matcher4<A, B, C, D, Z>;
	export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, Z>(a: PairCase<A, Z>, b: PairCase<B, Z>, c: PairCase<C, Z>, d: PairCase<D, Z>, e: PairCase<E, Z>): Matcher5<A, B, C, D, E, Z>;
	export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, Z>(a: PairCase<A, Z>, b: PairCase<B, Z>, c: PairCase<C, Z>, d: PairCase<D, Z>, e: PairCase<E, Z>, f: PairCase<F, Z>): Matcher6<A, B, C, D, E, F, Z>;
	export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, Z>(a: PairCase<A, Z>, b: PairCase<B, Z>, c: PairCase<C, Z>, d: PairCase<D, Z>, e: PairCase<E, Z>, f: PairCase<F, Z>, g: PairCase<G, Z>): Matcher7<A, B, C, D, E, F, G, Z>;
	export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, Z>(a: PairCase<A, Z>, b: PairCase<B, Z>, c: PairCase<C, Z>, d: PairCase<D, Z>, e: PairCase<E, Z>, f: PairCase<F, Z>, g: PairCase<G, Z>, h: PairCase<H, Z>): Matcher8<A, B, C, D, E, F, G, H, Z>;
	export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, Z>(a: PairCase<A, Z>, b: PairCase<B, Z>, c: PairCase<C, Z>, d: PairCase<D, Z>, e: PairCase<E, Z>, f: PairCase<F, Z>, g: PairCase<G, Z>, h: PairCase<H, Z>, i: PairCase<I, Z>): Matcher9<A, B, C, D, E, F, G, H, I, Z>;
	export function match<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, Z>(a: PairCase<A, Z>, b: PairCase<B, Z>, c: PairCase<C, Z>, d: PairCase<D, Z>, e: PairCase<E, Z>, f: PairCase<F, Z>, g: PairCase<G, Z>, h: PairCase<H, Z>, i: PairCase<I, Z>, j: PairCase<J, Z>): Matcher10<A, B, C, D, E, F, G, H, I, J, Z>;
	export type PairCase<A extends Rt, Z> = [A, Case<A, Z>];

}
declare module 'types/never' {
	import { Runtype } from 'runtype';
	export interface Never extends Runtype<never> {
	    tag: 'never';
	}
	/**
	 * Validates nothing (unknown fails).
	 */
	export const Never: Never;

}
declare module 'types/void' {
	import { Unknown } from 'types/unknown';
	export type Void = Unknown;
	/**
	 * Void is an alias for Unknown
	 *
	 * @deprecated Please use Unknown instead
	 */
	export const Void: Unknown;

}
declare module 'types/boolean' {
	import { Runtype } from 'runtype';
	export interface Boolean extends Runtype<boolean> {
	    tag: 'boolean';
	}
	/**
	 * Validates that a value is a boolean.
	 */
	export const Boolean: Boolean;

}
declare module 'types/number' {
	import { Runtype } from 'runtype';
	export interface Number extends Runtype<number> {
	    tag: 'number';
	}
	/**
	 * Validates that a value is a number.
	 */
	export const Number: Number;

}
declare module 'types/symbol' {
	import { Runtype } from 'runtype';
	interface Sym extends Runtype<symbol> {
	    tag: 'symbol';
	} const Sym: Sym;
	export { Sym as Symbol };

}
declare module 'types/array' {
	import { Runtype, Static } from 'runtype'; type ArrayStaticType<E extends Runtype, RO extends boolean> = RO extends true ? ReadonlyArray<Static<E>> : Static<E>[];
	interface Arr<E extends Runtype, RO extends boolean> extends Runtype<ArrayStaticType<E, RO>> {
	    tag: 'array';
	    element: E;
	    isReadonly: RO;
	    asReadonly(): Arr<E, true>;
	} function Arr<E extends Runtype, RO extends boolean>(element: E): Arr<E, false>;
	export { Arr as Array };

}
declare module 'types/tuple' {
	import { Runtype, Static } from 'runtype';
	export interface Tuple1<A extends Runtype> extends Runtype<[Static<A>]> {
	    tag: 'tuple';
	    components: [A];
	}
	export interface Tuple2<A extends Runtype, B extends Runtype> extends Runtype<[Static<A>, Static<B>]> {
	    tag: 'tuple';
	    components: [A, B];
	}
	export interface Tuple3<A extends Runtype, B extends Runtype, C extends Runtype> extends Runtype<[Static<A>, Static<B>, Static<C>]> {
	    tag: 'tuple';
	    components: [A, B, C];
	}
	export interface Tuple4<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>]> {
	    tag: 'tuple';
	    components: [A, B, C, D];
	}
	export interface Tuple5<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>]> {
	    tag: 'tuple';
	    components: [A, B, C, D, E];
	}
	export interface Tuple6<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>]> {
	    tag: 'tuple';
	    components: [A, B, C, D, E, F];
	}
	export interface Tuple7<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>]> {
	    tag: 'tuple';
	    components: [A, B, C, D, E, F, G];
	}
	export interface Tuple8<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>]> {
	    tag: 'tuple';
	    components: [A, B, C, D, E, F, G, H];
	}
	export interface Tuple9<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>, Static<I>]> {
	    tag: 'tuple';
	    components: [A, B, C, D, E, F, G, H, I];
	}
	export interface Tuple10<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype, J extends Runtype> extends Runtype<[Static<A>, Static<B>, Static<C>, Static<D>, Static<E>, Static<F>, Static<G>, Static<H>, Static<I>, Static<J>]> {
	    tag: 'tuple';
	    components: [A, B, C, D, E, F, G, H, I, J];
	}
	/**
	 * Construct a tuple runtype from runtypes for each of its elements.
	 */
	export function Tuple<A extends Runtype>(A: A): Tuple1<A>;
	export function Tuple<A extends Runtype, B extends Runtype>(A: A, B: B): Tuple2<A, B>;
	export function Tuple<A extends Runtype, B extends Runtype, C extends Runtype>(A: A, B: B, C: C): Tuple3<A, B, C>;
	export function Tuple<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype>(A: A, B: B, C: C, D: D): Tuple4<A, B, C, D>;
	export function Tuple<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype>(A: A, B: B, C: C, D: D, E: E): Tuple5<A, B, C, D, E>;
	export function Tuple<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype>(A: A, B: B, C: C, D: D, E: E, F: F): Tuple6<A, B, C, D, E, F>;
	export function Tuple<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype>(A: A, B: B, C: C, D: D, E: E, F: F, G: G): Tuple7<A, B, C, D, E, F, G>;
	export function Tuple<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H): Tuple8<A, B, C, D, E, F, G, H>;
	export function Tuple<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I): Tuple9<A, B, C, D, E, F, G, H, I>;
	export function Tuple<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype, J extends Runtype>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J): Tuple10<A, B, C, D, E, F, G, H, I, J>;

}
declare module 'util' {
	export function hasKey<K extends string>(k: K, o: {}): o is {
	    [_ in K]: {};
	};

}
declare module 'types/record' {
	import { Runtype, Static } from 'runtype'; type RecordStaticType<O extends {
	    [_: string]: Runtype;
	}, RO extends boolean> = RO extends true ? {
	    readonly [K in keyof O]: Static<O[K]>;
	} : {
	    [K in keyof O]: Static<O[K]>;
	};
	export interface Record<O extends {
	    [_: string]: Runtype;
	}, RO extends boolean> extends Runtype<RecordStaticType<O, RO>> {
	    tag: 'record';
	    fields: O;
	    isReadonly: RO;
	    asReadonly(): Record<O, true>;
	}
	/**
	 * Construct a record runtype from runtypes for its values.
	 */
	export function InternalRecord<O extends {
	    [_: string]: Runtype;
	}, RO extends boolean>(fields: O, isReadonly: RO): Record<O, RO>;
	export function Record<O extends {
	    [_: string]: Runtype;
	}>(fields: O): Record<O, false>;
	export {};

}
declare module 'types/partial' {
	import { Runtype, Static } from 'runtype';
	export interface Part<O extends {
	    [_: string]: Runtype;
	}> extends Runtype<{
	    [K in keyof O]?: Static<O[K]>;
	}> {
	    tag: 'partial';
	    fields: O;
	}
	/**
	 * Construct a runtype for partial records
	 */
	export function Part<O extends {
	    [_: string]: Runtype;
	}>(fields: O): Part<O>;
	export { Part as Partial };

}
declare module 'types/dictionary' {
	import { Runtype, Static } from 'runtype';
	export interface StringDictionary<V extends Runtype> extends Runtype<{
	    [_: string]: Static<V>;
	}> {
	    tag: 'dictionary';
	    key: 'string';
	    value: V;
	}
	export interface NumberDictionary<V extends Runtype> extends Runtype<{
	    [_: number]: Static<V>;
	}> {
	    tag: 'dictionary';
	    key: 'number';
	    value: V;
	}
	/**
	 * Construct a runtype for arbitrary dictionaries.
	 */
	export function Dictionary<V extends Runtype>(value: V, key?: 'string'): StringDictionary<V>;
	export function Dictionary<V extends Runtype>(value: V, key?: 'number'): NumberDictionary<V>;

}
declare module 'types/union' {
	import { Runtype as Rt, Static } from 'runtype';
	export interface Union1<A extends Rt> extends Rt<Static<A>> {
	    tag: 'union';
	    alternatives: [A];
	    match: Match1<A>;
	}
	export interface Union2<A extends Rt, B extends Rt> extends Rt<Static<A> | Static<B>> {
	    tag: 'union';
	    alternatives: [A, B];
	    match: Match2<A, B>;
	}
	export interface Union3<A extends Rt, B extends Rt, C extends Rt> extends Rt<Static<A> | Static<B> | Static<C>> {
	    tag: 'union';
	    alternatives: [A, B, C];
	    match: Match3<A, B, C>;
	}
	export interface Union4<A extends Rt, B extends Rt, C extends Rt, D extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D>> {
	    tag: 'union';
	    alternatives: [A, B, C, D];
	    match: Match4<A, B, C, D>;
	}
	export interface Union5<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E];
	    match: Match5<A, B, C, D, E>;
	}
	export interface Union6<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F];
	    match: Match6<A, B, C, D, E, F>;
	}
	export interface Union7<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G];
	    match: Match7<A, B, C, D, E, F, G>;
	}
	export interface Union8<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H];
	    match: Match8<A, B, C, D, E, F, G, H>;
	}
	export interface Union9<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I];
	    match: Match9<A, B, C, D, E, F, G, H, I>;
	}
	export interface Union10<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I, J];
	    match: Match10<A, B, C, D, E, F, G, H, I, J>;
	}
	export interface Union11<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I, J, K];
	    match: Match11<A, B, C, D, E, F, G, H, I, J, K>;
	}
	export interface Union12<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I, J, K, L];
	    match: Match12<A, B, C, D, E, F, G, H, I, J, K, L>;
	}
	export interface Union13<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I, J, K, L, M];
	    match: Match13<A, B, C, D, E, F, G, H, I, J, K, L, M>;
	}
	export interface Union14<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I, J, K, L, M, N];
	    match: Match14<A, B, C, D, E, F, G, H, I, J, K, L, M, N>;
	}
	export interface Union15<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O];
	    match: Match15<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>;
	}
	export interface Union16<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O> | Static<P>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P];
	    match: Match16<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>;
	}
	export interface Union17<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O> | Static<P> | Static<Q>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q];
	    match: Match17<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>;
	}
	export interface Union18<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O> | Static<P> | Static<Q> | Static<R>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R];
	    match: Match18<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>;
	}
	export interface Union19<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt, S extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O> | Static<P> | Static<Q> | Static<R> | Static<S>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S];
	    match: Match19<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>;
	}
	export interface Union20<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt, S extends Rt, T extends Rt> extends Rt<Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O> | Static<P> | Static<Q> | Static<R> | Static<S> | Static<T>> {
	    tag: 'union';
	    alternatives: [A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T];
	    match: Match20<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>;
	}
	/**
	 * Construct a union runtype from runtypes for its alternatives.
	 */
	export function Union<A extends Rt>(A: A): Union1<A>;
	export function Union<A extends Rt, B extends Rt>(A: A, B: B): Union2<A, B>;
	export function Union<A extends Rt, B extends Rt, C extends Rt>(A: A, B: B, C: C): Union3<A, B, C>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt>(A: A, B: B, C: C, D: D): Union4<A, B, C, D>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt>(A: A, B: B, C: C, D: D, E: E): Union5<A, B, C, D, E>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F): Union6<A, B, C, D, E, F>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G): Union7<A, B, C, D, E, F, G>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H): Union8<A, B, C, D, E, F, G, H>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I): Union9<A, B, C, D, E, F, G, H, I>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J): Union10<A, B, C, D, E, F, G, H, I, J>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J, K: K): Union11<A, B, C, D, E, F, G, H, I, J, K>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J, K: K, L: L): Union12<A, B, C, D, E, F, G, H, I, J, K, L>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J, K: K, L: L, M: M): Union13<A, B, C, D, E, F, G, H, I, J, K, L, M>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J, K: K, L: L, M: M, N: N): Union14<A, B, C, D, E, F, G, H, I, J, K, L, M, N>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J, K: K, L: L, M: M, N: N, O: O): Union15<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J, K: K, L: L, M: M, N: N, O: O, P: P): Union16<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J, K: K, L: L, M: M, N: N, O: O, P: P, Q: Q): Union17<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J, K: K, L: L, M: M, N: N, O: O, P: P, Q: Q, R: R): Union18<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt, S extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J, K: K, L: L, M: M, N: N, O: O, P: P, Q: Q, R: R, S: S): Union19<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S>;
	export function Union<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt, S extends Rt, T extends Rt>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J, K: K, L: L, M: M, N: N, O: O, P: P, Q: Q, R: R, S: S, T: T): Union20<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T>;
	export interface Match1<A extends Rt> {
	    <Z>(a: Case<A, Z>): Matcher1<A, Z>;
	}
	export interface Match2<A extends Rt, B extends Rt> {
	    <Z>(a: Case<A, Z>, b: Case<B, Z>): Matcher2<A, B, Z>;
	}
	export interface Match3<A extends Rt, B extends Rt, C extends Rt> {
	    <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>): Matcher3<A, B, C, Z>;
	}
	export interface Match4<A extends Rt, B extends Rt, C extends Rt, D extends Rt> {
	    <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>, d: Case<D, Z>): Matcher4<A, B, C, D, Z>;
	}
	export interface Match5<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt> {
	    <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>, d: Case<D, Z>, e: Case<E, Z>): Matcher5<A, B, C, D, E, Z>;
	}
	export interface Match6<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt> {
	    <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>, d: Case<D, Z>, e: Case<E, Z>, f: Case<F, Z>): Matcher6<A, B, C, D, E, F, Z>;
	}
	export interface Match7<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt> {
	    <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>, d: Case<D, Z>, e: Case<E, Z>, f: Case<F, Z>, g: Case<G, Z>): Matcher7<A, B, C, D, E, F, G, Z>;
	}
	export interface Match8<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt> {
	    <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>, d: Case<D, Z>, e: Case<E, Z>, f: Case<F, Z>, g: Case<G, Z>, h: Case<H, Z>): Matcher8<A, B, C, D, E, F, G, H, Z>;
	}
	export interface Match9<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt> {
	    <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>, d: Case<D, Z>, e: Case<E, Z>, f: Case<F, Z>, g: Case<G, Z>, h: Case<H, Z>, i: Case<I, Z>): Matcher9<A, B, C, D, E, F, G, H, I, Z>;
	}
	export interface Match10<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt> {
	    <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>, d: Case<D, Z>, e: Case<E, Z>, f: Case<F, Z>, g: Case<G, Z>, h: Case<H, Z>, i: Case<I, Z>, j: Case<J, Z>): Matcher10<A, B, C, D, E, F, G, H, I, J, Z>;
	}
	export interface Match11<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt> {
	    <Z>(a: Case<A, Z>, b: Case<B, Z>, c: Case<C, Z>, d: Case<D, Z>, e: Case<E, Z>, f: Case<F, Z>, g: Case<G, Z>, h: Case<H, Z>, i: Case<I, Z>, j: Case<J, Z>, k: Case<K, Z>): Matcher11<A, B, C, D, E, F, G, H, I, J, K, Z>;
	}
	export interface Match12<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt> {
	    <Z>(A: Case<A, Z>, B: Case<B, Z>, C: Case<C, Z>, D: Case<D, Z>, E: Case<E, Z>, F: Case<F, Z>, G: Case<G, Z>, H: Case<H, Z>, I: Case<I, Z>, J: Case<J, Z>, K: Case<K, Z>, L: Case<L, Z>): Matcher12<A, B, C, D, E, F, G, H, I, J, K, L, Z>;
	}
	export interface Match13<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt> {
	    <Z>(A: Case<A, Z>, B: Case<B, Z>, C: Case<C, Z>, D: Case<D, Z>, E: Case<E, Z>, F: Case<F, Z>, G: Case<G, Z>, H: Case<H, Z>, I: Case<I, Z>, J: Case<J, Z>, K: Case<K, Z>, L: Case<L, Z>, M: Case<M, Z>): Matcher13<A, B, C, D, E, F, G, H, I, J, K, L, M, Z>;
	}
	export interface Match14<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt> {
	    <Z>(A: Case<A, Z>, B: Case<B, Z>, C: Case<C, Z>, D: Case<D, Z>, E: Case<E, Z>, F: Case<F, Z>, G: Case<G, Z>, H: Case<H, Z>, I: Case<I, Z>, J: Case<J, Z>, K: Case<K, Z>, L: Case<L, Z>, M: Case<M, Z>, N: Case<N, Z>): Matcher14<A, B, C, D, E, F, G, H, I, J, K, L, M, N, Z>;
	}
	export interface Match15<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt> {
	    <Z>(A: Case<A, Z>, B: Case<B, Z>, C: Case<C, Z>, D: Case<D, Z>, E: Case<E, Z>, F: Case<F, Z>, G: Case<G, Z>, H: Case<H, Z>, I: Case<I, Z>, J: Case<J, Z>, K: Case<K, Z>, L: Case<L, Z>, M: Case<M, Z>, N: Case<N, Z>, O: Case<O, Z>): Matcher15<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, Z>;
	}
	export interface Match16<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt> {
	    <Z>(A: Case<A, Z>, B: Case<B, Z>, C: Case<C, Z>, D: Case<D, Z>, E: Case<E, Z>, F: Case<F, Z>, G: Case<G, Z>, H: Case<H, Z>, I: Case<I, Z>, J: Case<J, Z>, K: Case<K, Z>, L: Case<L, Z>, M: Case<M, Z>, N: Case<N, Z>, O: Case<O, Z>, P: Case<P, Z>): Matcher16<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Z>;
	}
	export interface Match17<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt> {
	    <Z>(A: Case<A, Z>, B: Case<B, Z>, C: Case<C, Z>, D: Case<D, Z>, E: Case<E, Z>, F: Case<F, Z>, G: Case<G, Z>, H: Case<H, Z>, I: Case<I, Z>, J: Case<J, Z>, K: Case<K, Z>, L: Case<L, Z>, M: Case<M, Z>, N: Case<N, Z>, O: Case<O, Z>, P: Case<P, Z>, Q: Case<Q, Z>): Matcher17<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, Z>;
	}
	export interface Match18<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt> {
	    <Z>(A: Case<A, Z>, B: Case<B, Z>, C: Case<C, Z>, D: Case<D, Z>, E: Case<E, Z>, F: Case<F, Z>, G: Case<G, Z>, H: Case<H, Z>, I: Case<I, Z>, J: Case<J, Z>, K: Case<K, Z>, L: Case<L, Z>, M: Case<M, Z>, N: Case<N, Z>, O: Case<O, Z>, P: Case<P, Z>, Q: Case<Q, Z>, R: Case<R, Z>): Matcher18<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, Z>;
	}
	export interface Match19<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt, S extends Rt> {
	    <Z>(A: Case<A, Z>, B: Case<B, Z>, C: Case<C, Z>, D: Case<D, Z>, E: Case<E, Z>, F: Case<F, Z>, G: Case<G, Z>, H: Case<H, Z>, I: Case<I, Z>, J: Case<J, Z>, K: Case<K, Z>, L: Case<L, Z>, M: Case<M, Z>, N: Case<N, Z>, O: Case<O, Z>, P: Case<P, Z>, Q: Case<Q, Z>, R: Case<R, Z>, S: Case<S, Z>): Matcher19<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, Z>;
	}
	export interface Match20<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt, S extends Rt, T extends Rt> {
	    <Z>(A: Case<A, Z>, B: Case<B, Z>, C: Case<C, Z>, D: Case<D, Z>, E: Case<E, Z>, F: Case<F, Z>, G: Case<G, Z>, H: Case<H, Z>, I: Case<I, Z>, J: Case<J, Z>, K: Case<K, Z>, L: Case<L, Z>, M: Case<M, Z>, N: Case<N, Z>, O: Case<O, Z>, P: Case<P, Z>, Q: Case<Q, Z>, R: Case<R, Z>, S: Case<S, Z>, T: Case<T, Z>): Matcher20<A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, Z>;
	}
	export type Case<T extends Rt, Result> = (v: Static<T>) => Result;
	export type Matcher1<A extends Rt, Z> = (x: Static<A>) => Z;
	export type Matcher2<A extends Rt, B extends Rt, Z> = (x: Static<A> | Static<B>) => Z;
	export type Matcher3<A extends Rt, B extends Rt, C extends Rt, Z> = (x: Static<A> | Static<B> | Static<C>) => Z;
	export type Matcher4<A extends Rt, B extends Rt, C extends Rt, D extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D>) => Z;
	export type Matcher5<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E>) => Z;
	export type Matcher6<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F>) => Z;
	export type Matcher7<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G>) => Z;
	export type Matcher8<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H>) => Z;
	export type Matcher9<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I>) => Z;
	export type Matcher10<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J>) => Z;
	export type Matcher11<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K>) => Z;
	export type Matcher12<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L>) => Z;
	export type Matcher13<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M>) => Z;
	export type Matcher14<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N>) => Z;
	export type Matcher15<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O>) => Z;
	export type Matcher16<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O> | Static<P>) => Z;
	export type Matcher17<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O> | Static<P> | Static<Q>) => Z;
	export type Matcher18<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O> | Static<P> | Static<Q> | Static<R>) => Z;
	export type Matcher19<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt, S extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O> | Static<P> | Static<Q> | Static<R> | Static<S>) => Z;
	export type Matcher20<A extends Rt, B extends Rt, C extends Rt, D extends Rt, E extends Rt, F extends Rt, G extends Rt, H extends Rt, I extends Rt, J extends Rt, K extends Rt, L extends Rt, M extends Rt, N extends Rt, O extends Rt, P extends Rt, Q extends Rt, R extends Rt, S extends Rt, T extends Rt, Z> = (x: Static<A> | Static<B> | Static<C> | Static<D> | Static<E> | Static<F> | Static<G> | Static<H> | Static<I> | Static<J> | Static<K> | Static<L> | Static<M> | Static<N> | Static<O> | Static<P> | Static<Q> | Static<R> | Static<S> | Static<T>) => Z;

}
declare module 'types/intersect' {
	import { Runtype, Static } from 'runtype';
	export interface Intersect1<A extends Runtype> extends Runtype<Static<A>> {
	    tag: 'intersect';
	    intersectees: [A];
	}
	export interface Intersect2<A extends Runtype, B extends Runtype> extends Runtype<Static<A> & Static<B>> {
	    tag: 'intersect';
	    intersectees: [A, B];
	}
	export interface Intersect3<A extends Runtype, B extends Runtype, C extends Runtype> extends Runtype<Static<A> & Static<B> & Static<C>> {
	    tag: 'intersect';
	    intersectees: [A, B, C];
	}
	export interface Intersect4<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D>> {
	    tag: 'intersect';
	    intersectees: [A, B, C, D];
	}
	export interface Intersect5<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E>> {
	    tag: 'intersect';
	    intersectees: [A, B, C, D, E];
	}
	export interface Intersect6<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F>> {
	    tag: 'intersect';
	    intersectees: [A, B, C, D, E, F];
	}
	export interface Intersect7<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G>> {
	    tag: 'intersect';
	    intersectees: [A, B, C, D, E, F, G];
	}
	export interface Intersect8<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G> & Static<H>> {
	    tag: 'intersect';
	    intersectees: [A, B, C, D, E, F, G, H];
	}
	export interface Intersect9<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G> & Static<H> & Static<I>> {
	    tag: 'intersect';
	    intersectees: [A, B, C, D, E, F, G, H, I];
	}
	export interface Intersect10<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype, J extends Runtype> extends Runtype<Static<A> & Static<B> & Static<C> & Static<D> & Static<E> & Static<F> & Static<G> & Static<H> & Static<I> & Static<J>> {
	    tag: 'intersect';
	    intersectees: [A, B, C, D, E, F, G, H, I, J];
	}
	/**
	 * Construct an intersection runtype from runtypes for its alternatives.
	 */
	export function Intersect<A extends Runtype>(A: A): Intersect1<A>;
	export function Intersect<A extends Runtype, B extends Runtype>(A: A, B: B): Intersect2<A, B>;
	export function Intersect<A extends Runtype, B extends Runtype, C extends Runtype>(A: A, B: B, C: C): Intersect3<A, B, C>;
	export function Intersect<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype>(A: A, B: B, C: C, D: D): Intersect4<A, B, C, D>;
	export function Intersect<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype>(A: A, B: B, C: C, D: D, E: E): Intersect5<A, B, C, D, E>;
	export function Intersect<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype>(A: A, B: B, C: C, D: D, E: E, F: F): Intersect6<A, B, C, D, E, F>;
	export function Intersect<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype>(A: A, B: B, C: C, D: D, E: E, F: F, G: G): Intersect7<A, B, C, D, E, F, G>;
	export function Intersect<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H): Intersect8<A, B, C, D, E, F, G, H>;
	export function Intersect<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I): Intersect9<A, B, C, D, E, F, G, H, I>;
	export function Intersect<A extends Runtype, B extends Runtype, C extends Runtype, D extends Runtype, E extends Runtype, F extends Runtype, G extends Runtype, H extends Runtype, I extends Runtype, J extends Runtype>(A: A, B: B, C: C, D: D, E: E, F: F, G: G, H: H, I: I, J: J): Intersect10<A, B, C, D, E, F, G, H, I, J>;

}
declare module 'types/function' {
	import { Runtype } from 'runtype';
	export interface Function extends Runtype<(...args: any[]) => any> {
	    tag: 'function';
	}
	/**
	 * Construct a runtype for functions.
	 */
	export const Function: Function;

}
declare module 'types/callback' {
	import { Runtype } from 'runtype';
	export interface Callback0<Z> extends Runtype<() => Z> {
	    tag: 'callback';
	    args: [Z];
	}
	export interface Callback1<A, Z> extends Runtype<(a: A) => Z> {
	    tag: 'callback';
	    args: [A, Z];
	}
	export interface Callback2<A, B, Z> extends Runtype<(a: A, b: B) => Z> {
	    tag: 'callback';
	    args: [A, B, Z];
	}
	export function Callback<Z>(Z: Runtype<Z>): Callback0<Z>;
	export function Callback<A, Z>(A: Runtype<A>, Z: Runtype<Z>): Callback1<A, Z>;
	export function Callback<A, B, Z>(A: Runtype<A>, B: Runtype<B>, Z: Runtype<Z>): Callback2<A, B, Z>;

}
declare module 'types/promise' {
	import { Runtype } from 'runtype';
	export interface RuntypePromise<T> extends Runtype<Promise<T>> {
	    tag: 'promise';
	    type: T;
	}
	export function PromiseType<T>(type: Runtype<T>): any;

}
declare module 'types/lazy' {
	import { Runtype } from 'runtype';
	/**
	 * Construct a possibly-recursive Runtype.
	 */
	export function Lazy<A extends Runtype>(delayed: () => A): A;

}
declare module 'types/brand' {
	import { Runtype, Static } from 'runtype';
	export const RuntypeName: unique symbol;
	export interface Brand<B extends string, A extends Runtype> extends Runtype<Static<A> & {
	    [RuntypeName]: B;
	}> {
	    tag: 'brand';
	    brand: B;
	    entity: A;
	}
	export function Brand<B extends string, A extends Runtype>(brand: B, entity: A): Brand<B, A>;

}
declare module 'decorator' {
	import { Runtype } from 'runtype'; type PropKey = string | symbol;
	/**
	 * A parameter decorator. Explicitly mark the parameter as checked on every method call in combination with `@checked` method decorator. The number of `@check` params must be the same as the number of provided runtypes into `@checked`.\
	 * Usage:
	 * ```ts
	 * @checked(Runtype1, Runtype3)
	 * method(@check p1: Static1, p2: number, @check p3: Static3) { ... }
	 * ```
	 */
	export function check(target: any, propertyKey: PropKey, parameterIndex: number): void;
	/**
	 * A method decorator. Takes runtypes as arguments which correspond to the ones of the actual method.
	 *
	 * Usually, the number of provided runtypes must be _**the same as**_ or _**less than**_ the actual parameters.
	 *
	 * If you explicitly mark which parameter shall be checked using `@check` parameter decorator, the number of `@check` parameters must be _**the same as**_ the runtypes provided into `@checked`.
	 *
	 * Usage:
	 * ```ts
	 * @checked(Runtype1, Runtype2)
	 * method1(param1: Static1, param2: Static2, param3: any) {
	 *   ...
	 * }
	 *
	 * @checked(Runtype1, Runtype3)
	 * method2(@check param1: Static1, param2: any, @check param3: Static3) {
	 *   ...
	 * }
	 * ```
	 */
	export function checked(...runtypes: Runtype[]): (target: any, propertyKey: PropKey, descriptor: PropertyDescriptor) => void;
	export {};

}
declare module 'index' {
	export { Runtype, Static } from 'runtype';
	export * from 'reflect';
	export * from 'result';
	export * from 'contract';
	export * from 'match';
	export * from 'errors';
	export * from 'types/unknown';
	export * from 'types/never';
	export * from 'types/void';
	export { Literal, Undefined, Null } from 'types/literal';
	export * from 'types/boolean';
	export * from 'types/number';
	export * from 'types/string';
	export * from 'types/symbol';
	export * from 'types/array';
	export * from 'types/tuple';
	export * from 'types/record';
	export * from 'types/partial';
	export * from 'types/dictionary';
	export * from 'types/union';
	export * from 'types/intersect';
	export * from 'types/function';
	export * from 'types/callback';
	export * from 'types/promise';
	export { InstanceOf } from 'types/instanceof';
	export * from 'types/lazy';
	export * from 'types/constraint';
	export { Brand } from 'types/brand';
	export * from 'decorator';

}
declare module 'contract' {
	import { Runtype } from 'index';
	export interface Contract0<Z> {
	    enforce(f: () => Z): () => Z;
	}
	export interface Contract1<A, Z> {
	    enforce(f: (a: A) => Z): (a: A) => Z;
	}
	export interface Contract2<A, B, Z> {
	    enforce(f: (a: A, b: B) => Z): (a: A, b: B) => Z;
	}
	export interface Contract3<A, B, C, Z> {
	    enforce(f: (a: A, b: B, c: C) => Z): (a: A, b: B, c: C) => Z;
	}
	export interface Contract4<A, B, C, D, Z> {
	    enforce(f: (a: A, b: B, c: C, d: D) => Z): (a: A, b: B, c: C, d: D) => Z;
	}
	export interface Contract5<A, B, C, D, E, Z> {
	    enforce(f: (a: A, b: B, c: C, d: D, e: E) => Z): (a: A, b: B, c: C, d: D, e: E) => Z;
	}
	export interface Contract6<A, B, C, D, E, F, Z> {
	    enforce(f: (a: A, b: B, c: C, d: D, e: E, f: F) => Z): (a: A, b: B, c: C, d: D, e: E, f: F) => Z;
	}
	export interface Contract7<A, B, C, D, E, F, G, Z> {
	    enforce(f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Z): (a: A, b: B, c: C, d: D, e: E, f: F, g: G) => Z;
	}
	export interface Contract8<A, B, C, D, E, F, G, H, Z> {
	    enforce(f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Z): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H) => Z;
	}
	export interface Contract9<A, B, C, D, E, F, G, H, I, Z> {
	    enforce(f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => Z): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I) => Z;
	}
	export interface Contract10<A, B, C, D, E, F, G, H, I, J, Z> {
	    enforce(f: (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => Z): (a: A, b: B, c: C, d: D, e: E, f: F, g: G, h: H, i: I, j: J) => Z;
	}
	/**
	 * Create a function contract.
	 */
	export function Contract<Z>(Z: Runtype<Z>): Contract0<Z>;
	export function Contract<A, Z>(A: Runtype<A>, Z: Runtype<Z>): Contract1<A, Z>;
	export function Contract<A, B, Z>(A: Runtype<A>, B: Runtype<B>, Z: Runtype<Z>): Contract2<A, B, Z>;
	export function Contract<A, B, C, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, Z: Runtype<Z>): Contract3<A, B, C, Z>;
	export function Contract<A, B, C, D, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, Z: Runtype<Z>): Contract4<A, B, C, D, Z>;
	export function Contract<A, B, C, D, E, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, E: Runtype<E>, Z: Runtype<Z>): Contract5<A, B, C, D, E, Z>;
	export function Contract<A, B, C, D, E, F, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, E: Runtype<E>, F: Runtype<F>, Z: Runtype<Z>): Contract6<A, B, C, D, E, F, Z>;
	export function Contract<A, B, C, D, E, F, G, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, E: Runtype<E>, F: Runtype<F>, G: Runtype<G>, Z: Runtype<Z>): Contract7<A, B, C, D, E, F, G, Z>;
	export function Contract<A, B, C, D, E, F, G, H, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, E: Runtype<E>, F: Runtype<F>, G: Runtype<G>, H: Runtype<H>, Z: Runtype<Z>): Contract8<A, B, C, D, E, F, G, H, Z>;
	export function Contract<A, B, C, D, E, F, G, H, I, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, E: Runtype<E>, F: Runtype<F>, G: Runtype<G>, H: Runtype<H>, I: Runtype<I>, Z: Runtype<Z>): Contract9<A, B, C, D, E, F, G, H, I, Z>;
	export function Contract<A, B, C, D, E, F, G, H, I, J, Z>(A: Runtype<A>, B: Runtype<B>, C: Runtype<C>, D: Runtype<D>, E: Runtype<E>, F: Runtype<F>, G: Runtype<G>, H: Runtype<H>, I: Runtype<I>, J: Runtype<J>, Z: Runtype<Z>): Contract10<A, B, C, D, E, F, G, H, I, J, Z>;

}
