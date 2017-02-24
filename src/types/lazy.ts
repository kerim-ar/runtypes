import { Rt, create } from './base'

/**
 * Construct a possibly-recursive Runtype.
 */
export function Lazy<A extends Rt>(delayed: () => A) {
  const data: any = {
    get tag() { return (getWrapped() as any)['tag'] }
  }

  let cached: A
  function getWrapped() {
    if (!cached) {
      cached = delayed()
      for (const k in cached)
        if (k !== 'tag')
          data[k] = cached[k]
    }
    return cached
  }

  return create<A>(x => {
    return getWrapped().check(x)
  }, data)
}
