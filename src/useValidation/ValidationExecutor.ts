import { ValidationRule } from './useValidation'
import { ValidationAbortedError } from './ValidationAbortedError'

export class ValidationRuleExecutor<T> {
  private controller = new AbortController()

  public abort(): void {
    this.controller.abort()

    this.controller = new AbortController()
  }

  public async validate(value: T, name: string, rules: ValidationRule<T>[]): Promise<string> {
    const { signal } = this.controller

    for (const rule of rules) {
      if (signal.aborted) {
        throw new ValidationAbortedError()
      }

      // eslint-disable-next-line no-await-in-loop
      const result = await rule(value, name, signal)

      if (result === false) {
        return `${name} is not valid`
      }

      if (typeof result === 'string') {
        return result
      }
    }

    return ''
  }

}