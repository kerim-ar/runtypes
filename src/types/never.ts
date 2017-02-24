import { Runtype, create, ValidationError } from './base'

export interface Never extends Runtype<never> { tag: 'never' }

/**
 * Validates nothing (always fails).
 */
export const Never = create<Never>(x => {
  throw new ValidationError('Expected nothing but got something')
}, { tag: 'never' })
