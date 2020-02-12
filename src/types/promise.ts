import { Runtype, create } from '../runtype';

export interface RuntypePromise<T> extends Runtype<Promise<T>> {
  tag: 'promise';
  type: T;
}

export function PromiseType<T>(type: Runtype<T>): RuntypePromise<T> {
  return create(
    value => {
      if (!value || typeof value.then !== 'function') {
        return {
          success: false,
          message: `Expected Promise, but was ${value === null ? value : typeof value}`,
        };
      }

      const res = new Promise<T>(async (resolve, reject) => {
        const data = await value;

        try {
          resolve(type.check(data));
        } catch (err) {
          reject(err);
        }
      });

      return { success: true, value: res };
    },
    { tag: 'promise', type },
  );
}
