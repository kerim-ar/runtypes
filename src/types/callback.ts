import { Runtype, create } from '../runtype';
import { Contract } from '..';

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
export function Callback(...args: Runtype[]): any {
  return create(
    value => {
      if (typeof value !== 'function') {
        return {
          success: false,
          message: `Expected callback to be an function, but was ${
            value === null ? value : typeof value
          }`,
        };
      }

      // @ts-ignore
      return { success: true, value: Contract(...args).enforce(value) };
    },
    { tag: 'callback', args },
  );
}
