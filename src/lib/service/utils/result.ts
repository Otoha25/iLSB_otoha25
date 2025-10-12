export type Result<T = void, E = void> =
  | { type: 'success'; value: T }
  | { type: 'error'; error: E };

export function success<T>(value: T): Result<T, never> {
  return { type: 'success', value };
}

export function error<E>(error: E): Result<never, E> {
  return { type: 'error', error };
}

export function isSuccess<T, E>(result: Result<T, E>): result is { type: 'success'; value: T } {
  return result.type === 'success';
}

export function isError<T, E>(result: Result<T, E>): result is { type: 'error'; error: E } {
  return result.type === 'error';
}
